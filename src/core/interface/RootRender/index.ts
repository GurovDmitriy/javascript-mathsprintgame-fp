import { ComponentStateful } from "../Component"

export interface RootRender {
  render(root: Element, componentRoot: () => ComponentStateful): void
}
