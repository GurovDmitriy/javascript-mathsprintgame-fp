import { Observable } from "rxjs"

export interface Game {
  state: Observable<GameState>
  choice(value: number): void
  play(): void
  controlA(): void
  controlB(): void
}

export interface GameEquations {
  values: number[]
  type: "multiply" | "division"
  result: number
  evaluated: boolean
}

export interface GameState {
  active: boolean
  questionValue: number
  equations: GameEquations[]
}
