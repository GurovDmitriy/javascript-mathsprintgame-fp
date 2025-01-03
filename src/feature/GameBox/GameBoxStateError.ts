import { Children, ComponentBase } from "@brainfuljs/brainful"
import { FromJS, fromJS } from "immutable"
import { inject, injectable } from "inversify"
import M from "mustache"
import * as R from "ramda"
import {
  BehaviorSubject,
  distinctUntilChanged,
  fromEvent,
  Observable,
  Subject,
  takeUntil,
  tap,
} from "rxjs"
import { containerApp } from "../../app/compositionRoot/container.ts"
import { TYPES } from "../../app/compositionRoot/types.ts"
import type { ErrorHandler, ErrorInfo, Game, Remote } from "../../interfaces"
import { Button } from "../../shared/components/Button"
import { childrenIterator } from "../../shared/tools/childrenIterator.ts"
import { delegate } from "../../shared/tools/delegate.ts"
import { GameBoxContext } from "./types.ts"

interface State {
  error: ErrorInfo | null
  children: {
    button: {
      component: Button
    }
  }
}

type StateImm = FromJS<State>

@injectable()
export class GameBoxStateError extends ComponentBase<GameBoxContext, StateImm> {
  public unsubscribe: Subject<void>
  public stateSubject: BehaviorSubject<StateImm>
  public state: Observable<StateImm>

  constructor(
    @inject(TYPES.ErrorHandler) private _errorHandler: ErrorHandler,
    @inject(TYPES.Game) private _game: Game,
    @inject(TYPES.Remote) private _remote: Remote,
  ) {
    super()

    this.unsubscribe = new Subject<void>()

    this.stateSubject = new BehaviorSubject<StateImm>(
      fromJS({
        error: null,
        children: {
          button: {
            component: containerApp.get(Button).setProps(() => ({
              classes: "btn--play-again btn-box__btn",
              content: "Try Again",
            })),
          },
        },
      }),
    )

    this.state = this.stateSubject.asObservable()

    this._handleToggleState()
    this._handleError()
  }

  onDestroy() {
    this.unsubscribe.next()
    this.unsubscribe.complete()
    this.stateSubject.complete()
  }

  children(): { forEach: (cb: (c: Children) => void) => void } {
    return childrenIterator(this.stateSubject)
  }

  private _handleToggleState() {
    fromEvent(this.host, "click")
      .pipe(
        takeUntil(this.unsubscribe),
        delegate("btn--play-again"),
        tap(() => {
          this._remote.replay()
          this.props.setState("start")
        }),
      )
      .subscribe()
  }

  private _handleError() {
    this._game.error
      .pipe(
        takeUntil(this.unsubscribe),
        distinctUntilChanged((previous, current) =>
          R.equals(previous, current),
        ),
        tap((error) => {
          this.stateSubject.next(
            this.stateSubject
              .getValue()
              .set("error", fromJS(this._errorHandler.handle(error))),
          )
        }),
      )
      .subscribe()
  }

  render() {
    const template = `
      <header class="header game__header">
        <h1 class="header__caption">Math Sprint Game</h1>

        <!-- nav -->
        <nav class="navigation header__navigation">
          <h2 class="navigation__caption visually-hidden">
            Navigation for Game
          </h2>

          <form class="form navigation__form">
            <div class="form__fieldset-wrapper">
              <!-- Score View -->
              <div class="fieldset form__fieldset" id="score-page">
                <!-- Score Container -->
                <div class="score fieldset__score">
                  <table class="table-score score__table-score">
                    <tr class="score__item score__item--title">
                      <th colspan="2"><h3>Error</h3></th>
                    </tr>
                    <tr class="table-score__item table-score__item--final-time">
                      <th>Message</th>
                      <td>{{state.error.message}}</td>
                    </tr>
                    <tr class="table-score__item table-score__item--base-time">
                      <th>Code</th>
                      <td>{{state.error.code}}</td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
          </form>
        </nav>
        <!-- Button -->
        <section class="btn-box form__btn-box">
          <h2 class="btn-box__caption visually-hidden">Play Buttons</h2>
           <div class="btn-quiz-box btn-box__btn-quiz-box" data-b-key="{{state.children.button.component.id}}">
          </div>
        </section>
      </header>
    `

    return M.render(template, {
      state: this.stateSubject.getValue().toJS(),
    })
  }
}
