import { injectable } from "inversify"
import type {
  ErrorCode,
  ErrorInfo,
  ErrorMessage,
  ErrorStatus,
} from "../../interfaces"

@injectable()
export class ErrorReadable implements ErrorInfo {
  public readonly message: ErrorMessage
  public readonly code: ErrorCode
  public readonly status: ErrorStatus

  constructor(message: ErrorMessage, code: ErrorCode, status: ErrorStatus) {
    this.message = message
    this.code = code
    this.status = status
  }
}
