export type Step = "start" | "countdown" | "quiz" | "score" | "error"

export interface GameBoxContext {
  setState: (name: Step) => void
}
