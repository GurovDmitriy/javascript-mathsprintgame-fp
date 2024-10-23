import { injectable } from "inversify"
import type { ErrorBase, ErrorCodeCustom, ErrorMessage } from "../../interfaces"

@injectable()
export class ErrorLight implements ErrorBase {
  public readonly name: string
  public readonly message: string
  public readonly code: string

  constructor(
    message: ErrorMessage = "Something went wrong",
    code: ErrorCodeCustom = "Unknown",
  ) {
    this.name = "ErrorLight"
    this.message = message
    this.code = code
  }
}
