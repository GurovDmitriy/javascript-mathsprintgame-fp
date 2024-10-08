export type ComponentNames = "start" | "countdown" | "quiz"

export interface GameBoxContext {
  setState: (name: ComponentNames) => void
}
