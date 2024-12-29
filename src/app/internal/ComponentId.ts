import type { IdGenerator } from "@brainfuljs/brainful"
import { injectable } from "inversify"
import { nanoid } from "nanoid/non-secure"

@injectable()
export class ComponentId implements IdGenerator {
  generate(): string {
    return `b-${nanoid(6)}`
  }
}
