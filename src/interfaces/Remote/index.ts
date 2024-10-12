export interface Remote {
  choice(value: number): void
  start(): void
  replay(): void
  wrong(): void
  right(): void
}
