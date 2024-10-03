import { Component } from "../Component"

export interface RootRender {
  render(root: Element, componentRoot: () => Component): void
}
