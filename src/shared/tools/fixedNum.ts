import { curry } from "ramda"

export const fixedNum = curry((count: number, value: number) =>
  parseFloat(value.toFixed(count)),
)
