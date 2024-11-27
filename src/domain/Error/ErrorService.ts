import { inject, injectable } from "inversify"
import * as R from "ramda"
import { TYPES } from "../../app/compositionRoot/types.js"
import type {
  ErrorBase,
  ErrorCode,
  ErrorConfig,
  ErrorCustom,
  ErrorDefault,
  ErrorGlobalHandler,
  ErrorHandler,
  ErrorInfo,
  ErrorMessage,
  ErrorStatus,
} from "../../interfaces/index.js"
import { ErrorHeavy } from "./ErrorHeavy.js"
import { ErrorLight } from "./ErrorLight.js"

@injectable()
export class ErrorService implements ErrorHandler {
  constructor(
    @inject(TYPES.ErrorGlobalHandler)
    private _errorGlobalHandler: ErrorGlobalHandler,
    @inject(TYPES.ErrorReadableFactory)
    private _errorReadableFactory: (
      message?: ErrorMessage,
      code?: ErrorCode,
      status?: ErrorStatus,
    ) => ErrorInfo,
    @inject(TYPES.ErrorConfig) private _errorConfig: ErrorConfig,
  ) {}

  handle(error: ErrorCustom | null): ErrorInfo | null {
    if (!error) return null

    return R.ifElse(
      (error: ErrorCustom) => this._isErrorBase(error),
      (error: ErrorBase) => {
        const stateInit = {
          status: error.status,
          message:
            this._errorConfig.config[error.status]?.message ||
            "Something went wrong",
          code: this._errorConfig.config[error.status]?.code || 200,
          level: this._errorConfig.config[error.status]?.level,
          location: this._errorConfig.config[error.status]?.location,
          errorReadable: null as ErrorInfo | null,
        }

        return R.pipe(
          (state: typeof stateInit) =>
            R.assoc(
              "errorReadable",
              this._errorReadableFactory(
                state.message,
                state.code,
                state.status,
              ),
              state,
            ),
          R.cond([
            [
              (state: typeof stateInit) => R.equals(state.level, "log"),
              (state) => {
                this._handleLevelLog(state.errorReadable)
                return state
              },
            ],
            [
              (state: typeof stateInit) => R.equals(state.level, "warning"),
              (state) => {
                this._handleLevelWarn(state.errorReadable)
                return state
              },
            ],
            [
              (state: typeof stateInit) => R.equals(state.level, "error"),
              (state) => {
                this._handleLevelError(state.errorReadable)
                return state
              },
            ],
            [R.T, (state) => state],
          ]),
          R.cond([
            [
              (state: typeof stateInit) => R.equals(state.location, "global"),
              (state) => {
                this._errorGlobalHandler.handle(state.errorReadable)
                return state
              },
            ],
            [R.T, (state) => state],
          ]),
          (state) => state.errorReadable,
        )(stateInit)
      },
      (error: ErrorDefault) => {
        const stateInit = {
          errorReadable: this._errorReadableFactory(
            "Something went wrong",
            200,
            "unknown",
          ),
        }

        return R.pipe((state: typeof stateInit) => {
          this._handleLevelError(error)
          this._errorGlobalHandler.handle(state.errorReadable)
          return state.errorReadable
        })(stateInit)
      },
    )(error as any)
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

  private _isErrorBase(error: ErrorCustom): error is ErrorBase {
    return error instanceof ErrorLight || error instanceof ErrorHeavy
  }

  private _isErrorDefault(error: ErrorCustom): error is ErrorDefault {
    return error instanceof Error
  }
}
