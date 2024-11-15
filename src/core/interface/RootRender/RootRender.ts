import { ComponentStateful } from "../Component/index.js"

export interface RootRender {
  render(root: Element, componentRoot: () => ComponentStateful): void
}
