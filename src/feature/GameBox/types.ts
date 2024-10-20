export type ComponentNames = "start" | "countdown" | "quiz" | "score" | "error"

export interface GameBoxContext {
  setState: (name: ComponentNames) => void
}
