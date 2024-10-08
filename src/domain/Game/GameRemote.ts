import { inject, injectable } from "inversify"
import { TYPES } from "../../app/compositionRoot/types"
import type { Game, Remote } from "../../interfaces"

/**
 * GameMathSprint - abstraction
 * Powered by Bridge design pattern
 */
@injectable()
export class GameRemote implements Remote {
  public game: Game

  constructor(@inject(TYPES.Game) game: Game) {
    this.game = game
  }

  choice(value: number) {
    this.game.choice(value)
  }

  start() {
    this.game.play()
  }

  buttonA() {
    this.game.markWrong()
  }

  buttonB() {
    this.game.markRight()
  }
}
