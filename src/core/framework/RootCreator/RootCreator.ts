import { injectable } from "inversify"
import { from } from "rxjs"
import type { ComponentStateful, RootRender } from "../../interface/index.js"

@injectable()
export class RootCreator implements RootRender {
  render(root: Element, rootComponent: () => ComponentStateful) {
    queueMicrotask(() => {
      const component = rootComponent()

      const host = document.createElement("div")
      host.setAttribute("data-b-key", component.id)

      root.replaceChildren(host)

      component.setParent({
        host: root,
        state: from<any>([]),
      } as unknown as ComponentStateful)

      component.mount()
    })
  }
}
