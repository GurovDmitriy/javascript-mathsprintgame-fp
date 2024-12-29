import { describe, expect, it } from "@jest/globals"
import { of } from "rxjs"
import {
  type ErrorCode,
  ErrorConfig,
  ErrorGlobalHandler,
  type ErrorInfo,
  type ErrorMessage,
  type ErrorStatus,
} from "../../interfaces"
import { ErrorLight, ErrorReadable, ErrorService } from "../Error"

describe("ErrorReadable", () => {
  it("should be return null", () => {
    // arrange
    const configStub = {
      config: {
        customType: {
          message: "You not select count question",
          code: 200,
          level: "log",
          location: "local",
        },
      },
    } satisfies ErrorConfig

    const globalHandlerStub = {
      error: of(null),
      reset() {},
      handle() {},
    } satisfies ErrorGlobalHandler

    const errorReadableFactoryStub = ((
      message?: ErrorMessage,
      code?: ErrorCode,
      status?: ErrorStatus,
    ) => ({ message, code, status }) as ErrorInfo) satisfies (
      message?: ErrorMessage,
      code?: ErrorCode,
      status?: ErrorStatus,
    ) => ErrorInfo

    const sut = new ErrorService(
      configStub,
      globalHandlerStub,
      errorReadableFactoryStub,
    )

    // act
    const error = sut.handle(null)

    // assert
    expect(error).toEqual(null)
  })

  it("should be return errorBase", () => {
    // arrange
    const configStub = {
      config: {
        customType: {
          message: "You not select count question",
          code: 200,
          level: "log",
          location: "local",
        },
      },
    } satisfies ErrorConfig

    const globalHandlerStub = {
      error: of(null),
      reset() {},
      handle() {},
    } satisfies ErrorGlobalHandler

    const errorReadableFactoryStub = ((
      message?: ErrorMessage,
      code?: ErrorCode,
      status?: ErrorStatus,
    ) => ({ message, code, status }) as ErrorInfo) satisfies (
      message?: ErrorMessage,
      code?: ErrorCode,
      status?: ErrorStatus,
    ) => ErrorInfo

    const sut = new ErrorService(
      configStub,
      globalHandlerStub,
      errorReadableFactoryStub,
    )

    const errorMock = new ErrorLight("message", 200, "customType")
    const errorExpected = {
      message: "You not select count question",
      code: 200,
      status: "customType",
    }

    // act
    const error = sut.handle(errorMock)

    // assert
    expect(error).toEqual(errorExpected)
  })

  it("should be return errorInfo", () => {
    // arrange
    const configStub = {
      config: {
        customType: {
          message: "You not select count question",
          code: 200,
          level: "log",
          location: "local",
        },
      },
    } satisfies ErrorConfig

    const globalHandlerStub = {
      error: of(null),
      reset() {},
      handle() {},
    } satisfies ErrorGlobalHandler

    const errorReadableFactoryStub = ((
      message?: ErrorMessage,
      code?: ErrorCode,
      status?: ErrorStatus,
    ) => ({ message, code, status }) as ErrorInfo) satisfies (
      message?: ErrorMessage,
      code?: ErrorCode,
      status?: ErrorStatus,
    ) => ErrorInfo

    const sut = new ErrorService(
      configStub,
      globalHandlerStub,
      errorReadableFactoryStub,
    )

    const errorMock = new ErrorReadable("message", 200, "customType")
    const errorExpected = {
      message: "Something went wrong",
      code: 200,
      status: "unknown",
    }

    // act
    const error = sut.handle(errorMock)

    // assert
    expect(error).toEqual(errorExpected)
  })

  it("should be log with warn level", () => {
    // arrange
    const configStub = {
      config: {
        customType: {
          message: "You not select count question",
          code: 200,
          level: "warning",
          location: "local",
        },
      },
    } satisfies ErrorConfig

    const globalHandlerStub = {
      error: of(null),
      reset() {},
      handle() {},
    } satisfies ErrorGlobalHandler

    const errorReadableFactoryStub = ((
      message?: ErrorMessage,
      code?: ErrorCode,
      status?: ErrorStatus,
    ) => ({ message, code, status }) as ErrorInfo) satisfies (
      message?: ErrorMessage,
      code?: ErrorCode,
      status?: ErrorStatus,
    ) => ErrorInfo

    const sut = new ErrorService(
      configStub,
      globalHandlerStub,
      errorReadableFactoryStub,
    )

    const errorMock = new ErrorLight("message", 200, "customType")

    // act
    const error = sut.handle(errorMock)

    // assert
    expect(error).toBeTruthy()
  })

  it("should be log with error level", () => {
    // arrange
    const configStub = {
      config: {
        customType: {
          message: "You not select count question",
          code: 200,
          level: "error",
          location: "local",
        },
      },
    } satisfies ErrorConfig

    const globalHandlerStub = {
      error: of(null),
      reset() {},
      handle() {},
    } satisfies ErrorGlobalHandler

    const errorReadableFactoryStub = ((
      message?: ErrorMessage,
      code?: ErrorCode,
      status?: ErrorStatus,
    ) => ({ message, code, status }) as ErrorInfo) satisfies (
      message?: ErrorMessage,
      code?: ErrorCode,
      status?: ErrorStatus,
    ) => ErrorInfo

    const sut = new ErrorService(
      configStub,
      globalHandlerStub,
      errorReadableFactoryStub,
    )

    const errorMock = new ErrorLight("message", 200, "customType")

    // act
    const error = sut.handle(errorMock)

    // assert
    expect(error).toBeTruthy()
  })

  it("should be log with global location", () => {
    // arrange
    const configStub = {
      config: {
        customType: {
          message: "You not select count question",
          code: 200,
          level: "error",
          location: "global",
        },
      },
    } satisfies ErrorConfig

    const globalHandlerStub = {
      error: of(null),
      reset() {},
      handle() {},
    } satisfies ErrorGlobalHandler

    const errorReadableFactoryStub = ((
      message?: ErrorMessage,
      code?: ErrorCode,
      status?: ErrorStatus,
    ) => ({ message, code, status }) as ErrorInfo) satisfies (
      message?: ErrorMessage,
      code?: ErrorCode,
      status?: ErrorStatus,
    ) => ErrorInfo

    const sut = new ErrorService(
      configStub,
      globalHandlerStub,
      errorReadableFactoryStub,
    )

    const errorMock = new ErrorLight("message", 200, "customType")

    // act
    const error = sut.handle(errorMock)

    // assert
    expect(error).toBeTruthy()
  })

  it("should be use default message", () => {
    // arrange
    const configStub = {
      config: {},
    } satisfies ErrorConfig

    const globalHandlerStub = {
      error: of(null),
      reset() {},
      handle() {},
    } satisfies ErrorGlobalHandler

    const errorReadableFactoryStub = ((
      message?: ErrorMessage,
      code?: ErrorCode,
      status?: ErrorStatus,
    ) => ({ message, code, status }) as ErrorInfo) satisfies (
      message?: ErrorMessage,
      code?: ErrorCode,
      status?: ErrorStatus,
    ) => ErrorInfo

    const sut = new ErrorService(
      configStub,
      globalHandlerStub,
      errorReadableFactoryStub,
    )

    const errorMock = new ErrorLight("message", 200, "customType")

    // act
    const error = sut.handle(errorMock)

    // assert
    expect(error).toBeTruthy()
  })
})
