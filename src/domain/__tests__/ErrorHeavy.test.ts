import { describe, expect, it } from "@jest/globals"
import { ErrorHeavy } from "../Error/index.ts"

describe("ErrorHeavy", () => {
  it("should be set fields", () => {
    // arrange
    const message = "error message"
    const code = 200
    const status = "error status"

    // act
    const sut = new ErrorHeavy(message, code, status)

    // assert
    expect(sut.message).toEqual(message)
    expect(sut.code).toEqual(code)
    expect(sut.status).toEqual(status)
  })
})
