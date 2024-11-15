import { compile } from "handlebars"
import { FromJS, fromJS } from "immutable"
import { inject, injectable } from "inversify"
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
import { TYPES } from "../../app/compositionRoot/types"
import { TYPES as T } from "../../core/compositionRoot/types"
import { ComponentBase } from "../../core/framework/Component"
import type { Sweeper } from "../../core/interface"
import type { ErrorHandler, ErrorInfo, Game, Remote } from "../../interfaces"
import { Button } from "../../shared/components/Button"
import { delegate } from "../../shared/tools/delegate"
import { GameBoxContext } from "./types"

interface State {
  error: ErrorInfo | null
}

type StateImm = FromJS<State>

@injectable()
export class GameBoxStateError extends ComponentBase<GameBoxContext, StateImm> {
  public unsubscribe: Subject<void>
  public stateSubject: BehaviorSubject<StateImm>
  public state: Observable<StateImm>

  constructor(
    @inject(T.Sweeper) blinder: Sweeper,
    @inject(TYPES.ErrorHandler) private _errorHandler: ErrorHandler,
    @inject(TYPES.Game) private _game: Game,
    @inject(TYPES.Remote) private _remote: Remote,
    public button: Button,
  ) {
    super(blinder)

    this.unsubscribe = new Subject<void>()

    this.stateSubject = new BehaviorSubject<StateImm>(
      fromJS({
        error: null,
      }),
    )

    this.state = this.stateSubject.asObservable()
  }

  onInit() {
    this._handleSetProps()
    this._handleError()
  }

  onMounted() {
    this._handleToggleState()
  }

  private _handleToggleState() {
    fromEvent(document, "click")
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

  private _handleSetProps() {
    this.button.setProps({
      classes: "btn--play-again btn-box__btn",
      content: "Try Again",
    })
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
    const template = compile(`
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
           <div class="btn-quiz-box btn-box__btn-quiz-box">
             {{{tryAgain}}}
          </div>
        </section>
      </header>
    `)

    return template({
      state: this.stateSubject.getValue().toJS(),
      tryAgain: this.button.render(),
    })
  }
}
