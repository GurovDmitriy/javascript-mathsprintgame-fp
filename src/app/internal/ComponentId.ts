import { injectable } from "inversify"
import { nanoid } from "nanoid/non-secure"
import { IdGenerator } from "../../core/interface/index.js"

@injectable()
export class ComponentId implements IdGenerator {
  generate(): string {
    return `b-${nanoid(6)}`
  }
}
