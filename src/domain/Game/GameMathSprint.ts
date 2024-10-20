import { fromJS, FromJS } from "immutable"
import { inject, injectable } from "inversify"
import * as R from "ramda"
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  Observable,
  of,
  scan,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from "rxjs"
import { TYPES } from "../../app/compositionRoot/types"
import type {
  ErrorCustom,
  Game,
  GameConfig,
  GameEquation,
  GameResult,
  GameScore,
  GameState,
} from "../../interfaces"
import { ErrorLight } from "../Error"
import { GAME_ERROR_CODE } from "./types"

type GameStateImm = FromJS<GameState>

@injectable()
export class GameMathSprint implements Game {
  private readonly _stateSubject: BehaviorSubject<GameStateImm>
  private readonly _errorSubject: BehaviorSubject<ErrorCustom | null>
  private readonly _choiceSubject: Subject<number>
  private readonly _unsubscribe = new Subject<void>()

  public readonly config: FromJS<GameConfig>
  public readonly state: Observable<GameStateImm>
  public readonly error: Observable<ErrorCustom | null>

  constructor(@inject(TYPES.GameConfig) config: GameConfig) {
    this._stateSubject = new BehaviorSubject<GameStateImm>(
      fromJS<GameState>({
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

    this._errorSubject = new BehaviorSubject<ErrorCustom | null>(null)
    this.error = this._errorSubject
      .asObservable()
      .pipe(distinctUntilChanged((previous, current) => previous === current))

    this._choiceSubject = new Subject<number>()
    this._choiceSubject
      .pipe(
        takeUntil(this._unsubscribe),
        debounceTime(200),
        tap((value) => this._handleChoice(value)),
      )
      .subscribe()

    this.config = fromJS(R.mergeAll([this._getConfigDefault(), config]))

    this._handleScore()
  }

  choice(value: number): void {
    R.tryCatch(
      R.pipe(
        (state) => this._handleIfExistError(state),
        (value) => this._choiceSubject.next(value),
      ),
      (error) => this._errorSubject.next(error),
    )(value)
  }

  play(): void {
    const stateInit = this._stateSubject
      .getValue()
      .get("questionValue") as number

    const isAvailablePlay = (state: typeof stateInit) => R.lte(state, 0)
    const ifNotAvailable = () => {
      throw new ErrorLight(
        "Question not selected",
        GAME_ERROR_CODE.questionNotSelected,
      )
    }
    const updateState = () => {
      this._stateSubject.next(
        this._stateSubject.getValue().setIn(["active"], true),
      )
    }

    R.tryCatch(
      R.pipe(
        (state) => this._handleIfExistError(state),
        R.ifElse(isAvailablePlay, ifNotAvailable, updateState),
      ),
      (error) => this._errorSubject.next(error),
    )(stateInit)
  }

  reset(): void {
    const clearError = () => this._handleClearError()
    const clearState = () => {
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
    }

    R.tryCatch(R.pipe(clearError, clearState), (error) =>
      this._errorSubject.next(error),
    )()
  }

  markRight(): void {
    R.tryCatch(
      R.pipe(
        () => this._handleIfExistError(),
        () => this._handleMark(true),
      ),
      (error) => this._errorSubject.next(error),
    )()
  }

  markWrong(): void {
    R.tryCatch(
      R.pipe(
        () => this._handleIfExistError(),
        () => this._handleMark(false),
      ),
      (error) => this._errorSubject.next(error),
    )()
  }

  private _handleIfExistError<T = undefined>(state?: T): T | undefined {
    const error = this._errorSubject.getValue()

    return R.ifElse(
      (err: typeof error) => R.equals(err, null),
      () => state,
      (error) => {
        throw error
      },
    )(error)
  }

  private _handleClearError() {
    this._errorSubject.next(null)
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

    const isQuestionEnd = (state: typeof stateInit) =>
      R.equals(state.end, false)

    const setEquationNext = (state: typeof stateInit) =>
      R.assoc(
        "equationNext",
        R.when(
          (state: typeof stateInit) =>
            R.lt(state.equationActive, R.dec(state.equationsCount)),
          () => R.inc(state.equationActive),
        )(state) as number,
        state,
      )

    const setEnd = (state: typeof stateInit) =>
      R.assoc(
        "end",
        R.gt(R.inc(state.equationActive), R.dec(state.equationsCount)),
        state,
      )

    const updateState = (state: typeof stateInit) => {
      this._stateSubject.next(
        this._stateSubject
          .getValue()
          .set("equationActive", state.equationNext)
          .updateIn(["equations", state.equationActive], (item: any) =>
            item.set("answer", state.right),
          )
          .setIn(["end"], state.end),
      )

      return state
    }

    R.ifElse(
      isQuestionEnd,
      R.pipe(setEquationNext, setEnd, updateState),
      () => {},
    )(stateInit)
  }

  private _handleScore(): void {
    const stateInit = { start: 0, end: 0 }

    const filterPlayState = (state: GameStateImm) =>
      R.or(!!state.get("active"), !!state.get("end"))
    const playStateChanged = (previous: GameStateImm, current: GameStateImm) =>
      R.and(
        R.equals(previous.get("active"), current.get("active")),
        R.equals(previous.get("end"), current.get("end")),
      )

    const setStartEndTime = (acc: GameStateImm, curr: GameStateImm) =>
      R.cond([
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

    const calcResultAndScore = (state: typeof stateInit) =>
      this._getResultAndScore(state.start, state.end)

    const updateState = (state: ResultAndScore) => {
      this._stateSubject.next(
        this._stateSubject
          .getValue()
          .set("result", fromJS(state.result))
          .set("score", fromJS(state.score)),
      )

      return state
    }

    of(stateInit)
      .pipe(
        takeUntil(this._unsubscribe),
        switchMap((state: typeof stateInit) => {
          return this.state.pipe(
            filter(filterPlayState),
            distinctUntilChanged(playStateChanged),
            scan(setStartEndTime, state),
          )
        }),
        tap(R.pipe(calcResultAndScore, updateState)),
        catchError((error) => {
          this._errorSubject.next(error)
          return of(error)
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

    const setPenalty = (state: typeof stateInit) =>
      R.assocPath(
        ["result", "penalty"],
        R.pipe(
          (state: typeof stateInit) => state.equations,
          R.map((ge) => penaltyByAnswer(ge)),
          R.reduce(R.add, 0),
        )(state),
        state,
      )

    const setTotal = (state: typeof stateInit) =>
      R.assocPath(
        ["result", "total"],
        R.add(R.subtract(state.end, state.start), state.result.penalty),
        state,
      )

    const setBase = (state: typeof stateInit) =>
      R.assocPath(["result", "base"], R.subtract(state.end, state.start), state)

    const setScore = (state: typeof stateInit) =>
      R.assocPath(["score", String(state.questionValue)], record(state), state)

    return R.pipe(
      setPenalty,
      setTotal,
      setBase,
      setScore,
      R.omit(["equations", "questionValue", "start", "end"]),
    )(stateInit)
  }

  private _getConfigDefault(): GameConfig {
    return {
      penalty: 15000,
      questions: [10, 25, 50, 99],
    } as GameConfig
  }

  private _getStateRaw(): GameState {
    return this._stateSubject.getValue().toJS() as unknown as GameState
  }

  private _getEquations(count: number): GameEquation[] {
    const stateInit = {
      equationsArr: [] as unknown as GameEquation[],
      rightArr: [] as unknown as GameEquation[],
      wrongArr: [] as unknown as GameEquation[],
      rightCount: this._getNumberRandomInteger(1, count),
      count,
    }

    const setRightArr = (state: typeof stateInit) =>
      R.assoc(
        "rightArr",
        Array.from(
          { length: state.rightCount },
          () => this._getEquation(true),
          this,
        ),
        state,
      )

    const setWrongArr = (state: typeof stateInit) =>
      R.assoc(
        "wrongArr",
        Array.from(
          { length: R.subtract(state.count, state.rightCount) },
          () => this._getEquation(false),
          this,
        ),
        state,
      )

    const shuffleArray = (state: typeof stateInit) =>
      R.assoc(
        "equationsArr",
        this._getArrayShuffle(R.concat(state.rightArr, state.wrongArr)),
        state,
      )

    return R.pipe(setRightArr, setWrongArr, shuffleArray, (state) => {
      return state.equationsArr
    })(stateInit)
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

    const setResult = (state: typeof stateInit) =>
      R.assoc("result", R.multiply(state.values[0], state.values[1]), state)
    const setOffsetResult = (state: typeof stateInit) =>
      R.over(
        R.lensProp("result"),
        R.add(this._getNumberRandomInteger(1, 9)),
        state,
      )

    return R.pipe(
      setResult,
      R.ifElse(
        (state: typeof stateInit) => state.right,
        (state) => state,
        setOffsetResult,
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
