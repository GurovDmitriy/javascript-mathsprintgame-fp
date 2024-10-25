import { Observable } from "rxjs"

export type ErrorLevel = "log" | "warning" | "error"
export type ErrorLocation = "local" | "global"

export type ErrorCode = number
export type ErrorStatus = string
export type ErrorMessage = string

export type ErrorDefault = Error | unknown

export type ErrorCustom = ErrorBase | ErrorDefault

export interface ErrorBase {
  name: string
  message: ErrorMessage
  code: ErrorCode
  status: ErrorStatus
}

export interface ErrorInfo {
  message: ErrorMessage
  code: ErrorCode
  status: ErrorStatus
}

export type ErrorMap = Record<ErrorStatus, ErrorMessage>

export interface ErrorConfig {
  config: ErrorConfigMap
}

export type ErrorConfigMap = Record<
  ErrorStatus,
  {
    message: ErrorMessage
    code: ErrorCode
    level: ErrorLevel
    location: ErrorLocation
  }
>

export interface ErrorHandler {
  handle(error: ErrorCustom | null): ErrorInfo | null
}

export interface ErrorGlobalHandler {
  error: Observable<ErrorCustom | null>
  handle(error: ErrorCustom): void
  reset(): void
}
