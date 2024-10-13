import { fromJS, FromJS, List } from "immutable"
import { inject, injectable } from "inversify"
import * as R from "ramda"
import {
  BehaviorSubject,
  distinctUntilChanged,
  filter,
  mergeMap,
  of,
  scan,
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

@injectable()
export class GameMathSprint implements Game {
  private stateSubject
  private errorHandler

  public readonly config: GameConfig
  public state

  constructor(
    @inject(TYPES.ErrorHandler) errorHandler: ErrorHandler,
    @inject(TYPES.GameConfig) config: GameConfig,
  ) {
    this.stateSubject = new BehaviorSubject<GameStateImm>(
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
        score: {},
      }),
    )

    this.state = this.stateSubject.asObservable()

    this.errorHandler = errorHandler

    this.config = Object.assign(
      {
        penalty: 1500,
        questions: [10, 25, 50, 99],
      },
      config,
    )

    this._setScore()
  }

  choice(value: number) {
    this.stateSubject.next(
      this.stateSubject
        .getValue()
        .set("questionValue", value)
        .set("equations", fromJS(this._getEquations(value))),
    )
  }

  play() {
    const value = this.stateSubject.getValue().get("questionValue") as number

    if (value && value <= 0) {
      this.errorHandler.handle(Error("Question value not select"))
      return
    }

    this.stateSubject.next(
      this.stateSubject.getValue().set("active", fromJS(true)),
    )
  }

  reset() {
    this.stateSubject.next(
      this.stateSubject.getValue().merge(
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

  markRight() {
    this._mark(true)
  }

  markWrong() {
    this._mark(false)
  }

  private _mark(right: boolean) {
    const active = this.stateSubject.getValue().get("equationActive") as number
    const equations = this.stateSubject.getValue().get("equations") as List<any>

    if (active > equations.size - 1) {
      return
    }

    const nextActive = active + 1

    this.stateSubject.next(
      this.stateSubject
        .getValue()
        .set("equationActive", nextActive)
        .updateIn(["equations", active], (item: any) =>
          item.set("answer", right),
        ),
    )

    if (nextActive > equations.size - 1) {
      this.stateSubject.next(
        this.stateSubject.getValue().set("end", fromJS(true)),
      )
    }
  }

  private _getEquations(count: number): GameEquation[] {
    return R.pipe(
      () => this._getRandomNumber(1, count),
      (rightCount) =>
        R.concat(
          Array.from(
            { length: rightCount },
            () => this._getEquation(true),
            this,
          ),
          Array.from(
            { length: count - rightCount },
            () => this._getEquation(false),
            this,
          ),
        ),
      (arr) => arr,
    )()
  }

  private _getEquation(right: boolean): GameEquation {
    const leftNumber = this._getRandomNumber(0, 9)
    const rightNumber = this._getRandomNumber(0, 9)
    const result =
      leftNumber * rightNumber + (right ? 0 : this._getRandomNumber(1, 9))

    return {
      values: [leftNumber, rightNumber],
      type: "multiply",
      result,
      answer: null,
    }
  }

  private _getRandomNumber(min: number, max: number): number {
    const rand = min - 0.5 + Math.random() * (max - min + 1)
    return Math.round(rand)
  }

  private _setScore() {
    of({ start: 0, end: 0 })
      .pipe(
        mergeMap((initState) => {
          return this.state.pipe(
            filter(
              (state) =>
                Boolean(state.get("active")) || Boolean(state.get("end")),
            ),
            distinctUntilChanged(
              (previous, current) =>
                previous.get("active") === current.get("active") &&
                previous.get("end") === current.get("end"),
            ),
            scan((acc, curr) => {
              const currentTime = Date.now()
              if (curr.get("active") && !acc.start) {
                return { ...acc, start: currentTime }
              }

              if (curr.get("end")) {
                return { ...acc, end: currentTime }
              }

              return acc
            }, initState),
          )
        }),
        filter((data) => !!data.start && !!data.end),
        tap((data) => {
          const state = this.stateSubject.getValue().toJS()
          console.log("d", data)
          console.log("state", state)

          const isRight = (a: number, b: number, r: number, an: boolean) => {
            const result = R.multiply(a, b)
            const eq = result === r
            return an === eq
          }

          const result = state.equations.reduce(
            (acc, curr) =>
              isRight(curr.values[0], curr.values[1], curr.result, curr.answer)
                ? acc
                : acc + 15000,
            0,
          )
          console.log(result)

          this.stateSubject.next(
            this.stateSubject.getValue().set(
              "result",
              fromJS({
                total: data.end - data.start + result,
                base: data.end - data.start,
                penalty: result,
              }),
            ),
          )
        }),
      )
      .subscribe()
  }
}
