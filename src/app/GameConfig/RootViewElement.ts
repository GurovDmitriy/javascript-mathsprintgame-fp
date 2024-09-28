import { injectable } from "inversify"
import { RootElement } from "../../interfaces"

@injectable()
export class RootViewElement implements RootElement {
  element: Element

  constructor() {
    const element = document.querySelector(".navigation__form")

    if (element) {
      this.element = element
    } else {
      throw Error("Root view element not found")
    }
  }
}
