import { List } from "immutable"
import { inject, injectable } from "inversify"
import * as R from "ramda"
import { BehaviorSubject } from "rxjs"
import { TYPES } from "../../app/compositionRoot/types"
import type {
  ErrorHandler,
  Game,
  GameConfig,
  GameEquations,
  GameState,
} from "../../interfaces"

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
    this.stateSubject = new BehaviorSubject<GameState>({
      active: false,
      questionValue: 0,
      equations: List(),
    })
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
    this.stateSubject.next({
      ...this.stateSubject.getValue(),
      questionValue: value,
      equations: this.getEquations(value),
    })
  }

  play() {
    if (this.stateSubject.getValue().questionValue <= 0) {
      this.errorHandler.handle(Error("Question value not select"))
      return
    }

    this.stateSubject.next({
      ...this.stateSubject.getValue(),
      active: true,
    })
  }

  markRight() {}
  markWrong() {}

  private getEquations(count: number): List<GameEquations> {
    return R.pipe(
      () => this._getRandomNumber(1, count),
      (rightCount) =>
        R.concat(
          R.repeat(this._getEquationRight(), rightCount),
          R.repeat(this._getEquationsWrong(), count - rightCount),
        ),
      (arr) => List(arr),
    )()
  }

  private _getEquationRight(): GameEquations {
    const leftNumber = this._getRandomNumber(0, 9)
    const rightNumber = this._getRandomNumber(0, 9)
    const result = leftNumber * rightNumber
    return {
      values: [leftNumber, rightNumber],
      type: "multiply",
      result,
    }
  }

  private _getEquationsWrong(): GameEquations {
    const leftNumber = this._getRandomNumber(0, 9)
    const rightNumber = this._getRandomNumber(0, 9)
    const result = leftNumber * rightNumber + this._getRandomNumber(1, 9)

    return {
      values: [leftNumber, rightNumber],
      type: "multiply",
      result,
    }
  }

  private _getRandomNumber(min: number, max: number): number {
    const rand = min - 0.5 + Math.random() * (max - min + 1)
    return Math.round(rand)
  }
}
