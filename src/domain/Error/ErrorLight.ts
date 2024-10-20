import { ErrorBase } from "../../interfaces"

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
