export interface Component {
  init(): void
  destroy(): void
  handle(): void
  render(): void
}
