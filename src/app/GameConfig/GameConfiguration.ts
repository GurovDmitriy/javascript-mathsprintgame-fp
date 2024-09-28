import { injectable } from "inversify"

@injectable()
export class GameConfiguration {
  penalty = 1500
  questions = [10, 25, 50, 99]
}
