import { compile } from "handlebars"
import { fromJS, FromJS } from "immutable"
import { injectable } from "inversify"
import { BehaviorSubject, Observable, Subject } from "rxjs"
import { ComponentBase } from "../../core/framework/Component"
import type { ErrorCustom } from "../../interfaces"

interface State {
  error: ErrorCustom | null
}

type StateImm = FromJS<State>

@injectable()
export class ErrorGlobal extends ComponentBase<any, StateImm> {
  public unsubscribe: Subject<void>
  public stateSubject: BehaviorSubject<StateImm>
  public state: Observable<StateImm>

  constructor() {
    super()

    this.unsubscribe = new Subject<void>()
    this.stateSubject = new BehaviorSubject<StateImm>(fromJS({ error: null }))
    this.state = this.stateSubject.asObservable()
  }

  render() {
    const template = compile(`
      <div class="header-game-box">
        <div class="header-game-box__inner">
          Error Global
        </div>
        <div>
           Reload
        </div>
      </div>
    `)

    return template({})
  }
}
