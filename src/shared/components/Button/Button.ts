import { injectable } from "inversify"
import mustache from "mustache"
import { ComponentPure } from "../../../core/framework/Component/index.ts"

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
}
