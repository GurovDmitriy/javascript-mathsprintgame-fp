export type ComponentNames = "start" | "countdown" | "quiz" | "score"

export interface GameBoxContext {
  setState: (name: ComponentNames) => void
}
