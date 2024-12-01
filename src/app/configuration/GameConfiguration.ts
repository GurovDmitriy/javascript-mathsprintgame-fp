import { injectable } from "inversify"
import type { GameConfig } from "../../interfaces/index.ts"

@injectable()
export class GameConfiguration implements GameConfig {
  penalty = 1500
  questions = [10, 25, 50, 99]
}
