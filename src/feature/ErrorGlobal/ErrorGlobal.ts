import { Children, ComponentBase } from "@brainfuljs/brainful"
import { fromJS, FromJS } from "immutable"
import { injectable } from "inversify"
import M from "mustache"
import {
  BehaviorSubject,
  fromEvent,
  Observable,
  Subject,
  takeUntil,
  tap,
} from "rxjs"
import { containerApp } from "../../app/compositionRoot/container.ts"
import type { ErrorInfo } from "../../interfaces"
import { Button } from "../../shared/components/Button"
import { childrenIterator } from "../../shared/tools/childrenIterator.ts"
import { delegate } from "../../shared/tools/delegate.ts"

interface Props {
  error: ErrorInfo
  reset: () => void
}

interface State {
  children: {
    btn: {
      component: Button
    }
  }
}

type StateImm = FromJS<State>

@injectable()
export class ErrorGlobal extends ComponentBase<Props, StateImm> {
  public unsubscribe: Subject<void>
  public stateSubject: BehaviorSubject<StateImm>
  public state: Observable<StateImm>

  constructor() {
    super()

    this.unsubscribe = new Subject<void>()
    this.stateSubject = new BehaviorSubject<StateImm>(
      fromJS({
        children: {
          btn: {
            component: containerApp.get(Button).setProps(() => ({
              content: "Reload",
              classes: "error-global-btn",
            })),
          },
        },
      }),
    )
    this.state = this.stateSubject.asObservable()

    this._reload()
  }

  onDestroy() {
    this.unsubscribe.next()
    this.unsubscribe.complete()
  }

  children(): { forEach: (cb: (c: Children) => void) => void } {
    return childrenIterator(this.stateSubject)
  }

  private _reload() {
    fromEvent(this.host, "click")
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
    const template = `
      <div class="header-game-box">
        <div class="header-game-box__inner">
          <p class="header-game-box__error-global">{{message}}</p>
        </div>
        <div>
           <div class="header-game-box__error-global-btn" data-b-key="{{btn.id}}"></div>
        </div>
      </div>
    `

    return M.render(template, {
      message: this.props.error.message,
      btn: this.stateSubject.getValue().getIn(["children", "btn", "component"]),
    })
  }
}
