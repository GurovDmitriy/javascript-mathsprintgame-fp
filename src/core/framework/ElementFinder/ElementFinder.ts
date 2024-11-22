import { injectable } from "inversify"
import type { DomFinder } from "../../interface/index.js"

@injectable()
export class ElementFinder implements DomFinder {
  public find(node: Element, id: string): Element | null {
    if (node) {
      return node.querySelector(`[data-b-key=${id}]`)
    } else {
      return null
    }
  }
}
