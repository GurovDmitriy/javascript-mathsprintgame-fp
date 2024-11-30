import { inject, injectable } from "inversify"
import { from } from "rxjs"
import { TYPES } from "../../compositionRoot/types.ts"
import type {
  ComponentStateful,
  DomFinder,
  RootRender,
} from "../../interface/index.ts"

@injectable()
export class RootCreator implements RootRender {
  constructor(@inject(TYPES.ElementFinder) public domFinder: DomFinder) {}

  render(root: Element, rootComponent: () => ComponentStateful) {
    queueMicrotask(() => {
      const component = rootComponent()

      const host = document.createElement("div")
      host.setAttribute(this.domFinder.attr, component.id)

      root.replaceChildren(host)

      component.setParent({
        host: root,
        state: from<any>([]),
      } as unknown as ComponentStateful)

      component.mount()
    })
  }
}
