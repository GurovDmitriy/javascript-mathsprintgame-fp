import { injectable } from "inversify"
import * as R from "ramda"
import { BehaviorSubject, Observable, tap } from "rxjs"
import { RootCreator } from "../../core/framework/RootCreator/index.js"
import { ErrorGlobal } from "../../feature/ErrorGlobal/index.js"
import {
  ErrorCustom,
  ErrorGlobalHandler,
  ErrorInfo,
} from "../../interfaces/index.js"

type StateError = ErrorCustom | null

// TODO: create instance children
@injectable()
export class ErrorInformer implements ErrorGlobalHandler {
  private readonly _errorSubject: BehaviorSubject<StateError>
  public readonly error: Observable<StateError>

  constructor(
    private _rootCreator: RootCreator,
    private _errorGlobal: ErrorGlobal,
  ) {
    this._errorSubject = new BehaviorSubject<StateError>(null)
    this.error = this._errorSubject.asObservable()

    this._handleErrorScreen()
  }

  handle(error: ErrorCustom) {
    this._errorSubject.next(error)
  }

  reset() {
    if (window) {
      window.location.reload()
    }
  }

  private _handleErrorScreen() {
    this.error
      .pipe(
        tap((error: any) => {
          return R.ifElse(
            (error: ErrorInfo | null) => R.not(R.equals(error, null)),
            (error) => {
              const root = document.getElementById("root")
              this._errorGlobal.setProps(() => ({
                error: error as ErrorInfo,
                reset: this.reset,
              }))
              if (root) this._rootCreator.render(root, () => this._errorGlobal)
            },
            R.T,
          )(error)
        }),
      )
      .subscribe()
  }
}
