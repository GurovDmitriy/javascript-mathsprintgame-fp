import { inject, injectable } from "inversify"
import { TYPES } from "../../app/compositionRoot/types"
import type {
  ErrorConfig,
  ErrorCustom,
  ErrorHandler,
  ErrorInfo,
} from "../../interfaces"
import { ErrorHeavy } from "./ErrorHeavy"
import { ErrorLight } from "./ErrorLight"
import { ErrorReadable } from "./ErrorReadable"

@injectable()
export class ErrorService implements ErrorHandler {
  constructor(@inject(TYPES.ErrorConfig) private errorConfig: ErrorConfig) {}

  handle(error: ErrorCustom | null): ErrorInfo | null {
    if (!error) return null

    const errorCode = (error as any).code ? (error as any).code : undefined
    const info = this.errorConfig.config[errorCode]
    const errorReadable = new ErrorReadable(info.message, info.code)

    if (info.level === "log") {
      this._handleLevelLog(error)
    }

    if (info.level === "warning") {
      this._handleLevelWarn(error)
    }

    if (info.level === "error") {
      this._handleLevelError(error)
    }

    if (error instanceof ErrorLight) {
      return errorReadable
    }

    if (error instanceof ErrorHeavy) {
      return new ErrorReadable()
    }

    if (error instanceof Error) {
      return new ErrorReadable()
    }

    return new ErrorReadable()
  }

  private _handleLevelLog(error: ErrorCustom): void {
    console.log(error)
  }

  private _handleLevelWarn(error: ErrorCustom): void {
    console.warn(error)
  }

  private _handleLevelError(error: ErrorCustom): void {
    console.error(error)
  }
}
