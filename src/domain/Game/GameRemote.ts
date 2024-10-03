import { inject, injectable } from "inversify"
import { TYPES } from "../../app/compositionRoot/types"
import type { Game, Remote } from "../../interfaces"

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
    this.game.controlA()
  }

  buttonB() {
    this.game.controlB()
  }
}
