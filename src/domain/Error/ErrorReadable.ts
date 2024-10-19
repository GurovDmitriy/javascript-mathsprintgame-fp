import { ErrorCode, ErrorInfo, ErrorMessage } from "../../interfaces"

export class ErrorReadable implements ErrorInfo {
  public readonly message: ErrorMessage
  public readonly code: ErrorCode

  constructor(message?: ErrorMessage, code?: ErrorCode) {
    this.message = message || "Something went wrong"
    this.code = code || "Unknown"
  }
}
