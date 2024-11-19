import { compile } from "handlebars"
import { fromJS } from "immutable"
import { injectable } from "inversify"
import { BehaviorSubject, Observable, Subject } from "rxjs"
import { ComponentBase } from "../../../core/framework/Component"
import { Children } from "../../../core/interface"

interface Props {
  content: string
  classes?: string
}

@injectable()
export class ButtonHeavy extends ComponentBase {
  public unsubscribe: Subject<void>
  public stateSubject: BehaviorSubject<any>
  public state: Observable<any>
  public props: () => Props

  constructor() {
    super()

    this.props = () => ({}) as Props

    this.unsubscribe = new Subject<void>()
    this.stateSubject = new BehaviorSubject<any>(
      fromJS({
        add: { some: "name" },
      }),
    )
    this.state = this.stateSubject.asObservable()
  }

  setProps(cb: () => Props) {
    this.props = cb
    return this
  }

  children(): Children[] {
    return []
  }

  render() {
    const template = compile(`
      <button class="btn {{classes}}">
        {{content}}
      </button>
    `)

    const props = this.props()

    return template({
      content: props.content,
      classes: props.classes,
    })
  }
}
