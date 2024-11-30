import { inject, injectable } from "inversify"
import { TYPES } from "../../app/compositionRoot/types.ts"
import type { Game, Remote } from "../../interfaces/index.ts"

@injectable()
export class GameRemote implements Remote {
  constructor(@inject(TYPES.Game) private _game: Game) {}

  choice(value: number): void {
    this._game.choice(value)
  }

  start(): void {
    this._game.play()
  }

  replay(): void {
    this._game.reset()
  }

  wrong(): void {
    this._game.markWrong()
  }

  right(): void {
    this._game.markRight()
  }
}
