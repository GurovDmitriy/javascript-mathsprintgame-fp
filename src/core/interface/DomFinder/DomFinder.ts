export interface DomFinder {
  attr: string
  find(node: Element, id: string): Element | null
}
