import { inject, injectable } from "inversify"
import { BehaviorSubject } from "rxjs"
import { TYPES } from "../../app/CompositionRoot/types"
import type { ErrorHandler, GameConfig } from "../../interfaces"

interface Equations {
  values: number[]
  type: "multiply" | "division"
  result: number
  evaluated: boolean
}

interface State {
  active: boolean
  questionValue: number
  equations: Equations[]
}

@injectable()
export class Game {
  private stateSubject
  private errorHandler
  private readonly config: GameConfig

  public state

  constructor(
    @inject(TYPES.GameConfig) config: GameConfig,
    @inject(TYPES.ErrorHandler) errorHandler: ErrorHandler,
  ) {
    this.stateSubject = new BehaviorSubject<State>({
      active: false,
      questionValue: 0,
      equations: [],
    })
    this.state = this.stateSubject.asObservable()

    this.errorHandler = errorHandler

    this.config = {
      penalty: 1500,
      questions: [10, 25, 50, 99],
    }
    this.config = {
      ...this.config,
      ...config,
    }
  }

  setQuestionValue(value: number) {
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

  private getRightEquations() {
    const firstNumber = this.getRandom(0, 9)
    const secondNumber = this.getRandom(0, 9)
    const equationValue = firstNumber * secondNumber
    return {
      values: [firstNumber, secondNumber],
      type: "multiply",
      result: equationValue,
      evaluated: true,
    } satisfies Equations
  }

  private getRandom(min = 0, max = 5) {
    const rand = min - 0.5 + Math.random() * (max - min + 1)
    return Math.round(rand)
  }
}
