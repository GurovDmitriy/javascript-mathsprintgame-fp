import { injectable } from "inversify"
import type {
  ErrorBase,
  ErrorCode,
  ErrorMessage,
  ErrorStatus,
} from "../../interfaces/index.ts"

@injectable()
export class ErrorLight implements ErrorBase {
  public readonly name: string
  public readonly message: ErrorMessage
  public readonly code: ErrorCode
  public readonly status: ErrorStatus

  constructor(message: ErrorMessage, code: ErrorCode, status: ErrorStatus) {
    this.name = "ErrorLight"
    this.message = message
    this.code = code
    this.status = status
  }
}
