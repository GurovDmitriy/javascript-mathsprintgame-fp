import { injectable } from "inversify"
import type {
  ErrorConfig,
  ErrorCustom,
  ErrorHandler,
  ErrorInfo,
} from "../../interfaces"
import { ERROR_CODE } from "../../interfaces"
import { ErrorHeavy, ErrorLight } from "./ErrorCreator"
import { ErrorReadable } from "./ErrorReadable"

@injectable()
export class ErrorService implements ErrorHandler {
  private readonly errorMap = {
    [ERROR_CODE.questionNotSelected]: {
      message: "You not select count question",
      level: "log",
      code: 200,
    },
  } as ErrorConfig

  private readonly levelDefault = "log"
  private readonly codeDefault = "log"

  constructor() {}

  handle(error: ErrorCustom): ErrorInfo {
    if (error instanceof ErrorLight) {
      const info = this.errorMap[error.code]

      const errorReadable = new ErrorReadable(info.message, info.code)

      if (info.level === "log") {
        this._handleLevelLog(errorReadable)
      }

      return errorReadable
    }

    if (error instanceof ErrorHeavy) {
      this._handleLevelError(error)
      return new ErrorReadable()
    }

    if (error instanceof Error) {
      this._handleLevelError(error)
      return new ErrorReadable()
    }

    this._handleLevelError(error)
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
