import { injectable } from "inversify"
import type { DomFinder } from "../../interface/index.js"

@injectable()
export class ElementFinder implements DomFinder {
  public attr = "data-b-key"

  public find(node: Element, id: string): Element | null {
    if (node) {
      return node.querySelector(`[${this.attr}=${id}]`)
    } else {
      return null
    }
  }
}
