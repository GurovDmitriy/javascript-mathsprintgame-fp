import { FromJS } from "immutable"
import { Observable } from "rxjs"
import { ErrorCustom } from "../Error/index.ts"

export interface Game {
  state: Observable<FromJS<GameState>>
  error: Observable<ErrorCustom>
  config: FromJS<GameConfig>
  choice(value: number): void
  play(): void
  reset(): void
  markRight(): void
  markWrong(): void
}

export interface GameState {
  active: boolean
  end: boolean
  questionValue: number
  equationActive: number
  equations: GameEquation[]
  result: GameResult
  score: GameScore
}

export interface GameEquation {
  values: [number, number]
  type: "multiply" | "division"
  result: number
  answer: boolean | null
}

export interface GameConfig {
  penalty: number
  questions: number[]
}

export interface GameResult {
  total: number
  base: number
  penalty: number
}

export type GameScore = Record<string, number>
