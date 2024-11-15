import { injectable } from "inversify"
import type { ComponentStateful, RootRender } from "../../interface"

@injectable()
export class RootCreator implements RootRender {
  render(root: Element, componentRoot: () => ComponentStateful) {
    queueMicrotask(() => {
      const component = componentRoot()
      root.setAttribute("data-brainful-idparent", component.idParent)

      requestAnimationFrame(() => {
        component.create()
      })
    })
  }
}
