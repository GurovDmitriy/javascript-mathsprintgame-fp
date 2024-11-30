import { describe, expect, it, jest } from "@jest/globals"
import { FromJS } from "immutable"
import {
  type ErrorBase,
  type ErrorCode,
  type ErrorMessage,
  type ErrorStatus,
  GameConfig,
} from "../../interfaces/index.ts"
import { GameMathSprint } from "../Game/index.ts"

describe("GameMathSprint", () => {
  it("should be install config", () => {
    // arrange
    const configStub = { penalty: 1500, questions: [10] } satisfies GameConfig
    const errorStub = ((message, code, status) => ({
      status,
      code,
      message,
      name: "error",
    })) satisfies (
      message: ErrorMessage,
      code: ErrorCode,
      status: ErrorStatus,
    ) => ErrorBase

    // act
    const sut = new GameMathSprint(configStub, errorStub)

    // assert
    expect(sut.config).toBeTruthy()
    expect((sut.config as FromJS<typeof configStub>).toJS()).toEqual(configStub)
  })

  it("should be call to choice method", () => {
    // arrange
    const configStub = { penalty: 1500, questions: [10] } satisfies GameConfig
    const errorStub = ((message, code, status) => ({
      status,
      code,
      message,
      name: "error",
    })) satisfies (
      message: ErrorMessage,
      code: ErrorCode,
      status: ErrorStatus,
    ) => ErrorBase

    const sut = new GameMathSprint(configStub, errorStub)
    const spy = jest.spyOn(sut, "choice")
    const args = 10

    // act
    sut.choice(args)

    // assert
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(args)
  })

  it("should be call to play method", () => {
    // arrange
    const configStub = { penalty: 1500, questions: [10] } satisfies GameConfig
    const errorStub = ((message, code, status) => ({
      status,
      code,
      message,
      name: "error",
    })) satisfies (
      message: ErrorMessage,
      code: ErrorCode,
      status: ErrorStatus,
    ) => ErrorBase

    const sut = new GameMathSprint(configStub, errorStub)
    const spy = jest.spyOn(sut, "play")

    // act
    sut.play()

    // assert
    expect(spy).toBeCalledTimes(1)
  })

  it("should be call to markRight method", () => {
    // arrange
    const configStub = { penalty: 1500, questions: [10] } satisfies GameConfig
    const errorStub = ((message, code, status) => ({
      status,
      code,
      message,
      name: "error",
    })) satisfies (
      message: ErrorMessage,
      code: ErrorCode,
      status: ErrorStatus,
    ) => ErrorBase

    const sut = new GameMathSprint(configStub, errorStub)
    const spy = jest.spyOn(sut, "markRight")

    // act
    sut.markRight()

    // assert
    expect(spy).toBeCalledTimes(1)
  })

  it("should be call to markWrong method", () => {
    // arrange
    const configStub = { penalty: 1500, questions: [10] } satisfies GameConfig
    const errorStub = ((message, code, status) => ({
      status,
      code,
      message,
      name: "error",
    })) satisfies (
      message: ErrorMessage,
      code: ErrorCode,
      status: ErrorStatus,
    ) => ErrorBase

    const sut = new GameMathSprint(configStub, errorStub)
    const spy = jest.spyOn(sut, "markWrong")

    // act
    sut.markWrong()

    // assert
    expect(spy).toBeCalledTimes(1)
  })

  it("should be call to reset method", () => {
    // arrange
    const configStub = { penalty: 1500, questions: [10] } satisfies GameConfig
    const errorStub = ((message, code, status) => ({
      status,
      code,
      message,
      name: "error",
    })) satisfies (
      message: ErrorMessage,
      code: ErrorCode,
      status: ErrorStatus,
    ) => ErrorBase

    const sut = new GameMathSprint(configStub, errorStub)
    const spy = jest.spyOn(sut, "reset")

    // act
    sut.reset()

    // assert
    expect(spy).toBeCalledTimes(1)
  })

  it("should be notify error subscribers with type questionNotSelected", () => {
    // arrange
    const configStub = { penalty: 1500, questions: [10] } satisfies GameConfig
    const errorStub = ((message, code, status) => ({
      status,
      code,
      message,
      name: "error",
    })) satisfies (
      message: ErrorMessage,
      code: ErrorCode,
      status: ErrorStatus,
    ) => ErrorBase

    const errorStateInit = null
    const errorStateFirst = {
      code: 200,
      message: "Question not selected",
      name: "error",
      status: "questionNotSelected",
    }

    const errorMock = jest.fn()

    const sut = new GameMathSprint(configStub, errorStub)
    sut.error.subscribe({
      next: errorMock,
    })

    // act
    sut.play()

    // assert
    expect(errorMock).toHaveBeenCalledTimes(2)
    expect(errorMock.mock.calls[0][0]).toBe(errorStateInit)
    expect(errorMock.mock.calls[1][0]).toEqual(errorStateFirst)
  })

  it("should be notify state subscribers with new state", () => {
    // arrange
    const configStub = { penalty: 1500, questions: [10] } satisfies GameConfig
    const errorStub = ((message, code, status) => ({
      status,
      code,
      message,
      name: "error",
    })) satisfies (
      message: ErrorMessage,
      code: ErrorCode,
      status: ErrorStatus,
    ) => ErrorBase

    const sut = new GameMathSprint(configStub, errorStub)
    const stateMock = jest.fn()

    sut.state.subscribe({
      next: stateMock,
    })

    // act
    sut.choice(10)

    // assert
    expect(sut.state).toBeTruthy()
    expect(stateMock).toHaveBeenCalledTimes(2)
  })

  it("should be end game", () => {
    // arrange
    const configStub = { penalty: 1500, questions: [4] } satisfies GameConfig
    const errorStub = ((message, code, status) => ({
      status,
      code,
      message,
      name: "error",
    })) satisfies (
      message: ErrorMessage,
      code: ErrorCode,
      status: ErrorStatus,
    ) => ErrorBase

    const sut = new GameMathSprint(configStub, errorStub)
    const stateMock = jest.fn()

    sut.state.subscribe({
      next: stateMock,
    })

    // act
    sut.choice(4)
    sut.play()
    sut.markRight()
    sut.markRight()
    sut.markWrong()
    sut.markWrong()

    expect(sut.state).toBeTruthy()
    expect(stateMock).toHaveBeenCalledTimes(9)
  })

  it("should be throw error if mark answer after error event", () => {
    // arrange
    const configStub = { penalty: 1500, questions: [4] } satisfies GameConfig
    const errorStub = ((message, code, status) => ({
      status,
      code,
      message,
      name: "error",
    })) satisfies (
      message: ErrorMessage,
      code: ErrorCode,
      status: ErrorStatus,
    ) => ErrorBase

    const sut = new GameMathSprint(configStub, errorStub)
    const errorMock = jest.fn()

    sut.error.subscribe({
      next: errorMock,
    })

    // act
    sut.play()
    sut.markRight()

    expect(errorMock).toHaveBeenCalledTimes(2)
  })
})
