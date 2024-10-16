export interface ErrorHandler {
  handle(error: Error | unknown): void
}
