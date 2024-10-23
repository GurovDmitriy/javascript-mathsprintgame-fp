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

@injectable()
export class ErrorService implements ErrorHandler {
  constructor(
    @inject(TYPES.ErrorReadableFactory)
    private _errorReadableFactory: (
      message: string,
      code: string | number,
    ) => ErrorInfo,
    @inject(TYPES.ErrorConfig) private _errorConfig: ErrorConfig,
  ) {}

  handle(error: ErrorCustom | null): ErrorInfo | null {
    if (!error) return null

    const errorCode = (error as any).code ? (error as any).code : ""
    const info = this._errorConfig.config?.[errorCode] || {
      message: "",
      code: "",
    }

    const errorReadable = this._errorReadableFactory(info.message, info.code)

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
      return this._errorReadableFactory("", "")
    }

    if (error instanceof Error) {
      return this._errorReadableFactory("", "")
    }

    return this._errorReadableFactory("", "")
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
