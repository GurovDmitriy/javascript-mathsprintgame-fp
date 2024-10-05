import { injectable } from "inversify"
import { ComponentStateful } from "../../interface/Component"
import { RootRender } from "../../interface/RootRender"

@injectable()
export class RootCreator implements RootRender {
  render(root: Element, componentRoot: () => ComponentStateful) {
    requestAnimationFrame(() => {
      const component = componentRoot()
      root.setAttribute("data-painful-idparent", component.idParent)

      requestAnimationFrame(() => {
        component.create()
      })
    })
  }
}
