import { ErrorBase } from "../../interfaces"

export class ErrorHeavy extends Error implements ErrorBase {
  public readonly name: string
  public readonly code: string

  constructor(message: string, code: string) {
    super(message)

    this.name = "ErrorHeavy"
    this.code = code

    // @ts-ignore
    if (Error.captureStackTrace) {
      // @ts-ignore
      Error.captureStackTrace(this, ErrorHeavy)
    }
  }
}

export class ErrorLight implements ErrorBase {
  public readonly name: string
  public readonly message: string
  public readonly code: string

  constructor(message: string, code: string) {
    this.name = "ErrorLight"
    this.message = message
    this.code = code
  }
}
