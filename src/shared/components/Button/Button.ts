import { ComponentPure } from "@brainfuljs/brainful"
import { injectable } from "inversify"
import M from "mustache"

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

    return M.render(template, this.props)
  }
}
