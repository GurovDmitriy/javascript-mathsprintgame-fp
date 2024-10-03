import { injectable } from "inversify"
import { Component } from "../../interface/Component"
import { RootRender } from "../../interface/RootRender"

@injectable()
export class RootCreator implements RootRender {
  render(root: Element, componentRoot: () => Component) {
    queueMicrotask(() => {
      const component = componentRoot()
      root.setAttribute("data-painful-idparent", component.idParent)
      root.innerHTML = component.render()
    })
  }
}
