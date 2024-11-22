import { injectable } from "inversify"
import mustache from "mustache"
import { ComponentPure } from "../../../core/framework/Component/index.js"

interface Props {
  content: string
  classes: string
}

@injectable()
export class Button extends ComponentPure<Props> {
  constructor() {
    super()
  }

  render() {
    const template = `
      <button class="btn {{classes}}">
        {{content}}
      </button>
    `

    return mustache.render(template, this.props)
  }

  children(): void {}
}
