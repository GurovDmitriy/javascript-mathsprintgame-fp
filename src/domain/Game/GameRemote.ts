import { inject, injectable } from "inversify"
import { TYPES } from "../../app/compositionRoot/types"
import type { Game, Remote } from "../../interfaces"

@injectable()
export class GameRemote implements Remote {
  private _game: Game

  constructor(@inject(TYPES.Game) game: Game) {
    this._game = game
  }

  choice(value: number) {
    this._game.choice(value)
  }

  start() {
    this._game.play()
  }

  replay() {
    this._game.reset()
  }

  wrong() {
    this._game.markWrong()
  }

  right() {
    this._game.markRight()
  }
}
