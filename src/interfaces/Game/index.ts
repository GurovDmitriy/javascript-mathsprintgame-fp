import { FromJS } from "immutable"
import { Observable } from "rxjs"

export interface Game {
  config: GameConfig
  state: Observable<FromJS<GameState>>
  choice(value: number): void
  play(): void
  reset(): void
  markRight(): void
  markWrong(): void
}

export interface GameEquation {
  values: [number, number]
  type: "multiply" | "division"
  result: number
  answer: boolean | null
}

export interface GameState {
  active: boolean
  end: boolean
  questionValue: number
  equationActive: number
  equations: GameEquation[]
  score: any
}

export interface GameConfig {
  penalty: number
  questions: number[]
}
