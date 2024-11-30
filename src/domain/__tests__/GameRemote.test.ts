import { describe, expect, it, jest } from "@jest/globals"
import { Game } from "../../interfaces/index.ts"
import { GameRemote } from "../Game/index.ts"

describe("GameRemote", () => {
  it("should be call to choice method", () => {
    // arrange
    const sut = new GameRemote({
      choice() {},
    } as unknown as Game)

    const spy = jest.spyOn(sut, "choice")
    const args = 1

    // act
    sut.choice(args)

    // assert
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(args)
  })

  it("should be call to start method", () => {
    // arrange
    const sut = new GameRemote({
      play() {},
    } as unknown as Game)

    const spy = jest.spyOn(sut, "start")

    // act
    sut.start()

    // assert
    expect(spy).toBeCalledTimes(1)
  })

  it("should be call to replay method", () => {
    // arrange
    const sut = new GameRemote({
      reset() {},
    } as unknown as Game)

    const spy = jest.spyOn(sut, "replay")

    // act
    sut.replay()

    // assert
    expect(spy).toBeCalledTimes(1)
  })

  it("should be call to wrong method", () => {
    // arrange
    const sut = new GameRemote({
      markWrong() {},
    } as unknown as Game)

    const spy = jest.spyOn(sut, "wrong")

    // act
    sut.wrong()

    // assert
    expect(spy).toBeCalledTimes(1)
  })

  it("should be call to right method", () => {
    // arrange
    const sut = new GameRemote({
      markRight() {},
    } as unknown as Game)

    const spy = jest.spyOn(sut, "right")

    // act
    sut.right()

    // assert
    expect(spy).toBeCalledTimes(1)
  })
})
