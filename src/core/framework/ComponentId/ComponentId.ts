import { injectable } from "inversify"
import { nanoid } from "nanoid/non-secure"
import { IdGenerator } from "../../interface/index.js"

@injectable()
export class ComponentId implements IdGenerator {
  public generate(): string {
    return `b-${nanoid(10)}`
  }
}
