import { ComponentStateful } from "../Component/index.ts"

export interface RootRender {
  render(root: Element, rootComponent: () => ComponentStateful): void
}
