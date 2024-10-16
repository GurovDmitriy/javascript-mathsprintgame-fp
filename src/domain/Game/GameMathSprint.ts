import { fromJS, FromJS } from "immutable"
import { inject, injectable } from "inversify"
import * as R from "ramda"
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  filter,
  mergeMap,
  Observable,
  of,
  scan,
  Subject,
  takeUntil,
  tap,
} from "rxjs"
import { TYPES } from "../../app/compositionRoot/types"
import type {
  ErrorHandler,
  Game,
  GameConfig,
  GameEquation,
  GameState,
} from "../../interfaces"

type GameStateImm = FromJS<GameState>

// TODO: add libs in container
// TODO: test error service business error vs exception
// TODO: unit tests
@injectable()
export class GameMathSprint implements Game {
  private readonly _errorHandler: ErrorHandler

  private readonly _stateSubject: BehaviorSubject<GameStateImm>
  private readonly _choiceSubject: Subject<number>
  private readonly _unsubscribe = new Subject<void>()

  public readonly config: FromJS<GameConfig>
  public readonly state: Observable<GameStateImm>

  constructor(
    @inject(TYPES.ErrorHandler) errorHandler: ErrorHandler,
    @inject(TYPES.GameConfig) config: GameConfig,
  ) {
    this._errorHandler = errorHandler

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
    this._choiceSubject.next(value)
  }

  play(): void {
    R.tryCatch(
      R.ifElse(
        (value: number) => R.lte(value, 0),
        () => this._errorHandler.handle(Error("Question value not select")),
        () => this._stateSubject.getValue().setIn(["active"], true),
      ),
      (error) => this._errorHandler.handle(error),
    )(this._stateSubject.getValue().get("questionValue") as number)
  }

  reset(): void {
    R.tryCatch(
      () => {
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
      },
      (error) => this._errorHandler.handle(error),
    )()
  }

  markRight(): void {
    this._handleMark(true)
  }

  markWrong(): void {
    this._handleMark(false)
  }

  private _handleChoice(value: number): void {
    R.tryCatch(
      () => {
        this._stateSubject.next(
          this._stateSubject.getValue().merge(
            fromJS({
              questionValue: value,
              equations: this._getEquations(value),
            }),
          ),
        )
      },
      (error) => this._errorHandler.handle(error),
    )()
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

    R.tryCatch(
      () => {
        R.ifElse(
          (state: typeof stateInit) => R.equals(state.end, false),
          R.pipe(
            (state) => ({
              ...state,
              equationNext: R.when(
                (state: typeof stateInit) =>
                  R.lt(state.equationActive, R.dec(state.equationsCount)),
                () => R.inc(state.equationActive),
              )(state) as number,
              end: R.gt(
                R.inc(state.equationActive),
                R.dec(state.equationsCount),
              ),
            }),
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
      },
      (error) => this._errorHandler.handle(error),
    )()
  }

  private _handleScore(): void {
    const gameDuration = of({ start: 0, end: 0 }).pipe(
      takeUntil(this._unsubscribe),
      mergeMap((initState: { start: number; end: number }) => {
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
    )

    gameDuration
      .pipe(
        takeUntil(this._unsubscribe),
        tap((data) => {
          const { questionValue, score, equations } = this._getStateRaw()

          const penaltySum = R.pipe(
            () => equations,
            R.map((gameEquation: GameEquation) => {
              const actualAnswer = R.equals(
                R.multiply(...gameEquation.values),
                gameEquation.result,
              )
              const isCorrect = R.equals(actualAnswer, gameEquation.answer)

              return R.ifElse(
                () => isCorrect,
                () => 0,
                () => this.config.get("penalty") as number,
              )()
            }),
            R.reduce(R.add, 0),
          )()

          const resultCurrent = data.end - data.start + penaltySum

          const calcRecord =
            score[questionValue] > resultCurrent
              ? score[questionValue]
              : data.end - data.start + penaltySum

          this._stateSubject.next(
            this._stateSubject
              .getValue()
              .set(
                "result",
                fromJS({
                  total: data.end - data.start + penaltySum,
                  base: data.end - data.start,
                  penalty: penaltySum,
                }),
              )
              .set(
                "score",
                fromJS({
                  ...score,
                  [questionValue]: calcRecord,
                }),
              ),
          )
        }),
      )
      .subscribe()
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
    return R.pipe(
      () => this._getNumberRandomInteger(1, count),
      (rightCount) =>
        R.concat(
          Array.from(
            { length: rightCount },
            () => this._getEquation(true),
            this,
          ),
          Array.from(
            { length: R.subtract(count, rightCount) },
            () => this._getEquation(false),
            this,
          ),
        ),
      (arr) => this._getArrayShuffle(arr),
    )()
  }

  private _getEquation(right: boolean): GameEquation {
    return R.pipe(
      () =>
        ({
          values: [
            this._getNumberRandomInteger(1, 9),
            this._getNumberRandomInteger(1, 9),
          ],
          type: "multiply",
          result: 0,
          answer: null,
        }) satisfies GameEquation,
      (state) =>
        R.assoc("result", R.multiply(state.values[0], state.values[1]), state),
      (state) =>
        R.ifElse(
          () => right,
          () => state,
          () =>
            R.over(
              R.lens(R.prop("result"), R.assoc("result")),
              R.add(this._getNumberRandomInteger(1, 9)),
              state,
            ),
        )(),
    )()
  }

  private _getArrayShuffle<T>(arr: T[]): T[] {
    const resultArr = [...arr]

    let currentIndex = resultArr.length
    let randomIndex

    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex -= 1
      ;[resultArr[currentIndex], resultArr[randomIndex]] = [
        resultArr[randomIndex],
        resultArr[currentIndex],
      ]
    }

    return resultArr
  }

  private _getNumberRandomInteger(min: number, max: number): number {
    const resultLens = R.lensProp<any>("result")

    return R.pipe(
      () => ({ min, max, result: 0 }),
      (state) => R.assoc("result", R.subtract(state.max, state.min), state),
      (state) => R.over(resultLens, R.inc, state),
      (state) => R.over(resultLens, R.multiply(Math.random()), state),
      (state) => R.over(resultLens, R.add(R.subtract(min, 0.5)), state),
      (state) => R.over(resultLens, Math.round, state),
      R.view(R.lensProp("result")),
    )()
  }
}
