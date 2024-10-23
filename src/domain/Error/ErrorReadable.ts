import { injectable } from "inversify"
import type { ErrorCode, ErrorInfo, ErrorMessage } from "../../interfaces"

@injectable()
export class ErrorReadable implements ErrorInfo {
  public readonly message: ErrorMessage
  public readonly code: ErrorCode

  constructor(
    message: ErrorMessage = "Something went wrong",
    code: ErrorCode = "Unknown",
  ) {
    this.message = message
    this.code = code
  }
}
