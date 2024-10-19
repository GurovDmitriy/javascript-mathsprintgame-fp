export type ErrorType = "message" | "exception"
export type ErrorLevel = "log" | "warning" | "error"
export type ErrorLocation = "local" | "global"

export type ErrorCode = string | number
export type ErrorCodeCustom = string
export type ErrorMessage = string

export type ErrorDefault = Error | unknown

export type ErrorCustom = ErrorBase | ErrorDefault

export interface ErrorBase {
  name: string
  message: ErrorMessage
  code?: ErrorCode
  codeCustom?: ErrorCodeCustom
}

/**
 * Described Error object
 */
export interface ErrorInfo {
  message: ErrorMessage
  code: ErrorCode
}

/**
 * Message - define as instance light error like a plain object
 * Exception - define as instance heavy error like a Error instance
 */
export const ERROR_TYPE: Record<ErrorType, ErrorType> = {
  message: "message",
  exception: "exception",
} as const

export const ERROR_LEVEL: Record<ErrorLevel, ErrorLevel> = {
  log: "log",
  warning: "warning",
  error: "error",
} as const

export const ERROR_LOCATION: Record<ErrorLocation, ErrorLocation> = {
  local: "local",
  global: "global",
} as const

/**
 * Custom code constant
 */
export type ErrorMap = Record<ErrorCode, ErrorMessage>

/**
 * Readable error config
 */
export type ErrorConfig = Record<
  ErrorCodeCustom,
  {
    message: ErrorMessage
    level?: ErrorLevel
    code?: ErrorCode
  }
>

export interface ErrorHandler {
  handle(error: ErrorCustom): ErrorInfo
}
