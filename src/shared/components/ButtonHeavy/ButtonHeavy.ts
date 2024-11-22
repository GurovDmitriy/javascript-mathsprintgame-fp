import { fromJS } from "immutable"
import { injectable } from "inversify"
import mustache from "mustache"
import {
  BehaviorSubject,
  fromEvent,
  Observable,
  Subject,
  takeUntil,
  tap,
} from "rxjs"
import { ComponentBase } from "../../../core/framework/Component/index.js"
import { delegate } from "../../tools/delegate.js"

interface Props {
  content: string
  classes: string
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
        count: 0,
      }),
    )
    this.state = this.stateSubject.asObservable()

    fromEvent(this.host, "click")
      .pipe(
        takeUntil(this.unsubscribe),
        delegate("btn-heavy"),
        tap(() => {
          console.log(123)

          this.stateSubject.next(
            this.stateSubject.getValue().updateIn(["count"], (v: number) => {
              return v + 1
            }),
          )
        }),
      )
      .subscribe()
  }

  onMounted() {
    console.log("on Mounted", this)
  }

  onUpdated() {
    console.log("on Update", this)
  }

  onDestroy() {
    console.log("on Destroy", this)
  }

  render() {
    const template = `
      <button class="btn btn-heavy {{classes}}">
        {{content}}
        {{count}}
      </button>
    `

    return mustache.render(template, {
      ...this.props,
      count: () => this.stateSubject.getValue().get("count"),
    })
  }
}
