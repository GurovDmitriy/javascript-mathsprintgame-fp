import { injectable } from "inversify"
import { ErrorHandler } from "../../interfaces"

@injectable()
export class ErrorService implements ErrorHandler {
  handle(error: Error) {
    console.error("Error custom action", error)
  }
}
