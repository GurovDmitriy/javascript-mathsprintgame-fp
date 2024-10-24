import { injectable } from "inversify"
import { BehaviorSubject, Observable, tap } from "rxjs"
import { RootCreator } from "../../core/framework/RenderRoot"
import { ErrorGlobal } from "../../feature/ErrorGlobal/ErrorGlobal"
import { ErrorCustom, ErrorGlobalHandler } from "../../interfaces"

type StateError = ErrorCustom | null

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
    console.log("next", error)
    this._errorSubject.next(error)
    console.log(this._errorSubject.getValue())
  }

  reset() {
    if (window) {
      window.location.reload()
    }
  }

  private _handleErrorScreen() {
    this.error
      .pipe(
        tap((error) => {
          if (error !== null) {
            const root = document.getElementById("root")
            if (root) this._rootCreator.render(root, () => this._errorGlobal)
          }
        }),
      )
      .subscribe()
  }
}
