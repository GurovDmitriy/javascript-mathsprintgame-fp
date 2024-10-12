import { fromJS, FromJS, List } from "immutable"
import { inject, injectable } from "inversify"
import * as R from "ramda"
import { BehaviorSubject } from "rxjs"
import { TYPES } from "../../app/compositionRoot/types"
import type {
  ErrorHandler,
  Game,
  GameConfig,
  GameEquation,
  GameState,
} from "../../interfaces"

type GameStateImm = FromJS<GameState>

/**
 * GameMathSprint - realization
 * Powered by Bridge design pattern
 */
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
        score: null,
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

    this.stateSubject.next(this.stateSubject.getValue().set("active", true))
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
          score: null,
        }),
      ),
    )
  }

  markRight() {
    const active = this.stateSubject.getValue().get("equationActive") as number
    const equations = this.stateSubject.getValue().get("equations") as List<any>

    if (active > equations.size - 1) {
      this.stateSubject.next(this.stateSubject.getValue().set("end", true))
      return
    }

    this.stateSubject.next(
      this.stateSubject
        .getValue()
        .set(
          "equationActive",
          (this.stateSubject.getValue().get("equationActive") as number) + 1,
        )
        .updateIn(["equations", active], (item) => item.set("answer", true)),
    )

    console.log(this.stateSubject.getValue().toJS())
  }

  markWrong() {
    const active = this.stateSubject.getValue().get("equationActive") as number
    const equations = this.stateSubject.getValue().get("equations") as List<any>

    if (active > equations.size - 1) {
      this.stateSubject.next(this.stateSubject.getValue().set("end", true))
      return
    }

    this.stateSubject.next(
      this.stateSubject
        .getValue()
        .set(
          "equationActive",
          (this.stateSubject.getValue().get("equationActive") as number) + 1,
        )
        .updateIn(["equations", active], (item) => item.set("answer", false)),
    )

    console.log(this.stateSubject.getValue().toJS())
  }

  private _getEquations(count: number): GameEquation[] {
    return R.pipe(
      () => this._getRandomNumber(1, count),
      (rightCount) =>
        R.concat(
          Array.from({ length: count }, this._getEquationRight, this),
          Array.from(
            { length: count - rightCount },
            this._getEquationsWrong,
            this,
          ),
        ),
      (arr) => arr,
    )()
  }

  private _getEquationRight(): GameEquation {
    const leftNumber = this._getRandomNumber(0, 9)
    const rightNumber = this._getRandomNumber(0, 9)
    const result = leftNumber * rightNumber
    return {
      values: [leftNumber, rightNumber],
      type: "multiply",
      result,
      answer: null,
    }
  }

  private _getEquationsWrong(): GameEquation {
    const leftNumber = this._getRandomNumber(0, 9)
    const rightNumber = this._getRandomNumber(0, 9)
    const result = leftNumber * rightNumber + this._getRandomNumber(1, 9)

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
}
