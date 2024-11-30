import { injectable } from "inversify"
import type {
  ErrorBase,
  ErrorCode,
  ErrorMessage,
  ErrorStatus,
} from "../../interfaces/index.ts"

@injectable()
export class ErrorHeavy extends Error implements ErrorBase {
  public readonly name: string
  public readonly message: ErrorMessage
  public readonly code: ErrorCode
  public readonly status: ErrorStatus

  constructor(message: ErrorMessage, code: ErrorCode, status: ErrorStatus) {
    super(message)

    this.name = "ErrorHeavy"
    this.message = message
    this.code = code
    this.status = status

    // @ts-ignore
    if (Error.captureStackTrace) {
      // @ts-ignore
      Error.captureStackTrace(this, ErrorHeavy)
    }
  }
}
