import { injectable } from "inversify"
import { GameConfig } from "../../interfaces"

@injectable()
export class GameConfiguration implements GameConfig {
  penalty = 15000
  questions = [10, 25, 50, 99]
}
