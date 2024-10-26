import { inject, injectable } from "inversify"
import { TYPES } from "../../app/compositionRoot/types"
import type { Game, Remote } from "../../interfaces"

@injectable()
export class GameRemote implements Remote {
  constructor(@inject(TYPES.Game) private _game: Game) {}

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
