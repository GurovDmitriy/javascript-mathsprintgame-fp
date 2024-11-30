import { describe, expect, it } from "@jest/globals"
import { ErrorLight } from "../Error/index.ts"

describe("ErrorLight", () => {
  it("should be set fields", () => {
    // arrange
    const message = "error message"
    const code = 200
    const status = "error status"

    // act
    const sut = new ErrorLight(message, code, status)

    // assert
    expect(sut.message).toEqual(message)
    expect(sut.code).toEqual(code)
    expect(sut.status).toEqual(status)
  })
})
