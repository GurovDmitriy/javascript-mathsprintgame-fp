import { inject, injectable } from "inversify"
import { BehaviorSubject } from "rxjs"
import { TYPES } from "../../app/CompositionRoot/types"
import { GameConfiguration } from "../../app/GameConfig"
import type {
  ErrorHandler,
  Game,
  GameEquations,
  GameState,
} from "../../interfaces"

@injectable()
export class GameMathSprint implements Game {
  private stateSubject
  private errorHandler
  private readonly config: GameConfiguration

  public state

  constructor(
    @inject(TYPES.ErrorHandler) errorHandler: ErrorHandler,
    config: GameConfiguration,
  ) {
    this.stateSubject = new BehaviorSubject<GameState>({
      active: false,
      questionValue: 0,
      equations: [],
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
      equations: [this.getRightEquations()],
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

  controlA() {}
  controlB() {}

  private getRightEquations() {
    const firstNumber = this.getRandom(0, 9)
    const secondNumber = this.getRandom(0, 9)
    const equationValue = firstNumber * secondNumber
    return {
      values: [firstNumber, secondNumber],
      type: "multiply",
      result: equationValue,
      evaluated: true,
    } satisfies GameEquations
  }

  private getRandom(min = 0, max = 5) {
    const rand = min - 0.5 + Math.random() * (max - min + 1)
    return Math.round(rand)
  }
}
