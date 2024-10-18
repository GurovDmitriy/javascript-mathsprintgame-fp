import Imm, { fromJS, FromJS } from "immutable"
import { inject, injectable } from "inversify"
import * as R from "ramda"
import { tryCatch } from "ramda"
import * as Rx from "rxjs"
import {
  distinctUntilChanged,
  filter,
  mergeMap,
  of,
  scan,
  takeUntil,
  tap,
} from "rxjs"
import { TYPES } from "../../app/compositionRoot/types"
import type {
  ErrorHandler,
  Game,
  GameConfig,
  GameEquation,
  GameResult,
  GameScore,
  GameState,
} from "../../interfaces"

type GameStateImm = FromJS<GameState>

// TODO: add libs in container
// TODO: test error service business error vs exception
// TODO: unit tests
@injectable()
export class GameMathSprint implements Game {
  private readonly _errorHandler: ErrorHandler

  private readonly _stateSubject: Rx.BehaviorSubject<GameStateImm>
  private readonly _choiceSubject: Rx.Subject<number>
  private readonly _unsubscribe = new Rx.Subject<void>()

  public readonly config: Imm.FromJS<GameConfig>
  public readonly state: Rx.Observable<GameStateImm>

  constructor(
    @inject(TYPES.ErrorHandler) errorHandler: ErrorHandler,
    @inject(TYPES.GameConfig) config: GameConfig,
  ) {
    this._errorHandler = errorHandler

    this._stateSubject = new Rx.BehaviorSubject<GameStateImm>(
      Imm.fromJS<GameState>({
        active: false,
        end: false,
        questionValue: 0,
        equationActive: 0,
        equations: [],
        result: {
          total: 0,
          base: 0,
          penalty: 0,
        },
        score: {},
      }),
    )
    this.state = this._stateSubject.asObservable()

    this._choiceSubject = new Rx.Subject<number>()
    this._choiceSubject
      .pipe(
        Rx.takeUntil(this._unsubscribe),
        Rx.debounceTime(200),
        Rx.tap((value) => this._handleChoice(value)),
      )
      .subscribe()

    this.config = Imm.fromJS(R.mergeAll([this._getConfigDefault(), config]))

    tryCatch(this._handleScore, this._errorHandler.handle)()
  }

  choice(value: number): void {
    R.tryCatch(this._choiceSubject.next, this._errorHandler.handle)(value)
  }

  play(): void {
    R.tryCatch(
      R.ifElse(
        (value: number) => R.lte(value, 0),
        () => this._errorHandler.handle(Error("Question value not select")),
        () => this._stateSubject.getValue().setIn(["active"], true),
      ),
      this._errorHandler.handle,
    )(this._stateSubject.getValue().get("questionValue") as number)
  }

  reset(): void {
    R.tryCatch(() => {
      this._stateSubject.next(
        this._stateSubject.getValue().merge(
          fromJS({
            active: false,
            end: false,
            questionValue: 0,
            equationActive: 0,
            equations: [],
            result: {
              total: 0,
              base: 0,
              penalty: 0,
            },
          }),
        ),
      )
    }, this._errorHandler.handle)()
  }

  markRight(): void {
    R.tryCatch(() => this._handleMark(true), this._errorHandler.handle)()
  }

  markWrong(): void {
    R.tryCatch(() => this._handleMark(false), this._errorHandler.handle)()
  }

  private _handleChoice(value: number): void {
    this._stateSubject.next(
      this._stateSubject.getValue().merge(
        fromJS({
          questionValue: value,
          equations: this._getEquations(value),
        }),
      ),
    )
  }

  private _handleMark(right: boolean): void {
    const { equationActive, equations, end } = this._getStateRaw()
    const stateInit = {
      right,
      equationActive,
      equationNext: equationActive,
      equationsCount: equations.length,
      end,
    }

    R.ifElse(
      (state: typeof stateInit) => R.equals(state.end, false),
      R.pipe(
        (state) =>
          R.assoc(
            "equationNext",
            R.when(
              (state: typeof stateInit) =>
                R.lt(state.equationActive, R.dec(state.equationsCount)),
              () => R.inc(state.equationActive),
            )(state) as number,
            state,
          ),
        (state) =>
          R.assoc(
            "end",
            R.gt(R.inc(state.equationActive), R.dec(state.equationsCount)),
            state,
          ),
        (state) => {
          this._stateSubject.next(
            this._stateSubject
              .getValue()
              .set("equationActive", state.equationNext)
              .updateIn(["equations", state.equationActive], (item: any) =>
                item.set("answer", state.right),
              )
              .setIn(["end"], state.end),
          )
        },
      ),
      () => {},
    )(stateInit)
  }

  private _handleScore(): void {
    const stateInit = { start: 0, end: 0 }

    of(stateInit)
      .pipe(
        takeUntil(this._unsubscribe),
        mergeMap((initState: typeof stateInit) => {
          return this.state.pipe(
            filter((state) => R.or(!!state.get("active"), !!state.get("end"))),
            distinctUntilChanged((previous, current) =>
              R.and(
                R.equals(previous.get("active"), current.get("active")),
                R.equals(previous.get("end"), current.get("end")),
              ),
            ),
            scan((acc, curr) => {
              return R.cond([
                [
                  ({ curr, acc }) => R.and(curr.get("active"), !acc.start),
                  ({ acc }) => ({ ...acc, start: Date.now() }),
                ],
                [
                  ({ curr }) => R.equals(curr.get("end"), true),
                  ({ acc }) => ({ ...acc, end: Date.now() }),
                ],
                [R.T, ({ acc }) => acc],
              ])({ acc, curr })
            }, initState),
          )
        }),
        tap((state) => {
          const { result, score } = this._getResultAndScore(
            state.start,
            state.end,
          )

          this._stateSubject.next(
            this._stateSubject
              .getValue()
              .mergeIn("result", fromJS(result))
              .mergeIn("score", fromJS(score)),
          )
        }),
      )
      .subscribe()
  }

  private _getResultAndScore(start: number, end: number): ResultAndScore {
    const stateRaw = this._getStateRaw()
    const stateInit = {
      equations: stateRaw.equations,
      result: {
        total: 0,
        base: 0,
        penalty: 0,
      },
      score: stateRaw.score,
      questionValue: stateRaw.questionValue,
      start,
      end,
    }

    const answerRight = (ge: GameEquation) =>
      R.equals(R.multiply(...ge.values), ge.result)

    const answerReal = (ge: GameEquation) => ge.answer

    const penaltyByAnswer = R.ifElse(
      (ge) => R.equals(answerRight(ge), answerReal(ge)),
      () => 0,
      () => this.config.get("penalty") as number,
    ) satisfies (ge: GameEquation) => number

    const record = R.ifElse(
      (state: typeof stateInit) =>
        R.gt(state.score[state.questionValue], state.result.total),
      (state: typeof stateInit) => state.score[state.questionValue],
      (state: typeof stateInit) => state.result.total,
    )

    return R.pipe(
      (state: typeof stateInit) =>
        R.assocPath(
          ["result", "penalty"],
          R.pipe(
            (state: typeof stateInit) => state.equations,
            R.map((ge) => penaltyByAnswer(ge)),
            R.reduce(R.add, 0),
          )(state),
          state,
        ),
      (state) =>
        R.assocPath(
          ["result", "total"],
          R.add(R.subtract(state.end, state.start), state.result.penalty),
          state,
        ),
      (state) =>
        R.assocPath(
          ["result", "base"],
          R.subtract(state.end, state.start),
          state,
        ),
      (state) =>
        R.assocPath(
          ["score", String(state.questionValue)],
          record(state),
          state,
        ),
      R.omit(["equations", "questionValue", "start", "end"]),
    )(stateInit)
  }

  private _getConfigDefault(): GameConfig {
    return {
      penalty: 15000,
      questions: [10, 25, 50, 99],
    }
  }

  private _getStateRaw(): GameState {
    return this._stateSubject.getValue().toJS() as unknown as GameState
  }

  private _getEquations(count: number): GameEquation[] {
    const stateInit = {
      rightArr: [] as unknown as GameEquation[],
      wrongArr: [] as unknown as GameEquation[],
      rightCount: this._getNumberRandomInteger(1, count),
      count,
    }

    return R.pipe(
      (state: typeof stateInit) =>
        R.assoc(
          "rightArr",
          Array.from(
            { length: state.rightCount },
            () => this._getEquation(true),
            this,
          ),
          state,
        ),
      (state) =>
        R.assoc(
          "wrongArr",
          Array.from(
            { length: R.subtract(state.count, state.rightCount) },
            () => this._getEquation(true),
            this,
          ),
          state,
        ),
      (state) =>
        this._getArrayShuffle(R.concat(state.rightArr, state.wrongArr)),
    )(stateInit)
  }

  private _getEquation(right: boolean): GameEquation {
    const stateInit = {
      values: [
        this._getNumberRandomInteger(1, 9),
        this._getNumberRandomInteger(1, 9),
      ],
      type: "multiply",
      result: 0,
      answer: null,
      right: right,
    } as GameEquation & { right: boolean }

    return R.pipe(
      (state: typeof stateInit) =>
        R.assoc("result", R.multiply(state.values[0], state.values[1]), state),
      R.ifElse(
        (state: typeof stateInit) => state.right,
        (state) => state,
        R.over(R.lensProp("result"), R.add(this._getNumberRandomInteger(1, 9))),
      ),
      R.omit(["right"]),
    )(stateInit)
  }

  private _getArrayShuffle<T>(arr: ArrayShuffle<T>): ArrayShuffle<T> {
    return R.addIndex(R.reduce<T, ArrayShuffle<T>>)(
      (acc, _, index) => {
        const randomIndex = Math.floor(R.multiply(Math.random(), R.inc(index)))

        ;[acc[index], acc[randomIndex]] = [acc[randomIndex], acc[index]]
        return acc
      },
      [...arr],
    )(arr)
  }

  private _getNumberRandomInteger(min: number, max: number): number {
    const stateInit = { min, max, result: 0 }
    const resultLens = R.lensProp<any>("result")

    return R.pipe(
      (state: typeof stateInit) =>
        R.assoc("result", R.subtract(state.max, state.min), state),
      (state) => R.over(resultLens, R.inc, state),
      (state) => R.over(resultLens, R.multiply(Math.random()), state),
      (state) => R.over(resultLens, R.add(R.subtract(min, 0.5)), state),
      (state) => R.over(resultLens, Math.round, state),
      R.view(R.lensProp("result")),
    )(stateInit)
  }
}

interface ResultAndScore {
  result: GameResult
  score: GameScore
}

type ArrayShuffle<T> = T[]
