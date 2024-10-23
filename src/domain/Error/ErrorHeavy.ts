import { injectable } from "inversify"
import type { ErrorBase, ErrorCodeCustom, ErrorMessage } from "../../interfaces"

@injectable()
export class ErrorHeavy extends Error implements ErrorBase {
  public readonly name: string
  public readonly message: ErrorMessage
  public readonly code: ErrorCodeCustom

  constructor(
    message: ErrorMessage = "Something went wrong",
    code: ErrorCodeCustom = "Unknown",
  ) {
    super(message)

    this.name = "ErrorHeavy"
    this.message = message
    this.code = code

    // @ts-ignore
    if (Error.captureStackTrace) {
      // @ts-ignore
      Error.captureStackTrace(this, ErrorHeavy)
    }
  }
}
