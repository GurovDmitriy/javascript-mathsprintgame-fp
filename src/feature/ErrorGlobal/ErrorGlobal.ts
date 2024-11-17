import { compile } from "handlebars"
import { fromJS, FromJS } from "immutable"
import { injectable } from "inversify"
import {
  BehaviorSubject,
  fromEvent,
  Observable,
  Subject,
  takeUntil,
  tap,
} from "rxjs"
import { ComponentBase } from "../../core/framework/Component"
import type { ErrorInfo } from "../../interfaces"
import { Button } from "../../shared/components/Button"
import { delegate } from "../../shared/tools/delegate"

interface State {}
interface Props {
  error: ErrorInfo
  reset: () => void
}

type StateImm = FromJS<State>

@injectable()
export class ErrorGlobal extends ComponentBase<Props, StateImm> {
  public unsubscribe: Subject<void>
  public stateSubject: BehaviorSubject<StateImm>
  public state: Observable<StateImm>

  constructor(public readonly btn: Button) {
    super()

    this.unsubscribe = new Subject<void>()
    this.stateSubject = new BehaviorSubject<StateImm>(fromJS({}))
    this.state = this.stateSubject.asObservable()
  }

  onCreate() {
    this._setProps()
    this._reload()
  }

  onMounted() {
    this._reload()
  }

  private _setProps() {
    this.btn.setProps({ content: "Reload", classes: "error-global-btn" })
  }

  private _reload() {
    fromEvent(document, "click")
      .pipe(
        takeUntil(this.unsubscribe),
        delegate("error-global-btn"),
        tap(() => {
          this.props.reset()
        }),
      )
      .subscribe()
  }

  render() {
    const template = compile(`
      <div class="header-game-box">
        <div class="header-game-box__inner">
          <p class="header-game-box__error-global">{{message}}</p>
        </div>
        <div>
           <div class="header-game-box__error-global-btn">
             {{{btn}}}
           </div>
        </div>
      </div>
    `)

    return template({
      message: this.props.error.message,
      btn: this.btn.render(),
    })
  }
}
