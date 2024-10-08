import { List } from "immutable"
import { Observable } from "rxjs"

export interface Game {
  config: GameConfig
  state: Observable<GameState>
  choice(value: number): void
  play(): void
  markRight(): void
  markWrong(): void
}

export interface GameEquations {
  values: number[]
  type: "multiply" | "division"
  result: number
}

export interface GameState {
  active: boolean
  questionValue: number
  equations: List<GameEquations>
}

export interface GameConfig {
  penalty: number
  questions: number[]
}
