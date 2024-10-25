import { compile } from "handlebars"
import { injectable } from "inversify"
import { ComponentPure } from "../../../core/framework/Component"

interface Props {
  content: string
  classes?: string
}

@injectable()
export class Button extends ComponentPure<Props> {
  constructor() {
    super()
  }

  render() {
    const template = compile(`
      <button class="btn {{classes}}">
        {{content}}
      </button>
    `)

    return template({
      content: this.props.content || "",
      classes: this.props.classes || "",
    })
  }
}
