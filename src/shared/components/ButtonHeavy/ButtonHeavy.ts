import { compile } from "handlebars"
import { fromJS } from "immutable"
import { injectable } from "inversify"
import { BehaviorSubject, Observable, Subject } from "rxjs"
import { ComponentBase } from "../../../core/framework/Component"

interface Props {
  content: string
  classes?: string
}

@injectable()
export class ButtonHeavy extends ComponentBase<Props> {
  public unsubscribe: Subject<void>
  public stateSubject: BehaviorSubject<any>
  public state: Observable<any>

  constructor() {
    super()

    this.unsubscribe = new Subject<void>()
    this.stateSubject = new BehaviorSubject<any>(
      fromJS({
        add: { some: "name" },
      }),
    )
    this.state = this.stateSubject.asObservable()

    console.log("constructor button")
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
