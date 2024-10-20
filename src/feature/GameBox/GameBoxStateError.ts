import { compile } from "handlebars"
import { FromJS, fromJS } from "immutable"
import { inject, injectable } from "inversify"
import * as R from "ramda"
import {
  BehaviorSubject,
  distinctUntilChanged,
  filter,
  fromEvent,
  Subject,
  takeUntil,
  tap,
} from "rxjs"
import { TYPES } from "../../app/compositionRoot/types"
import { ComponentBase } from "../../core/framework/Component"
import type { ErrorHandler, ErrorInfo, Game, Remote } from "../../interfaces"
import { Button } from "../../shared/components/Button"
import { GameBoxContext } from "./types"

interface State {
  error: ErrorInfo | null
}

type StateImm = FromJS<State>

@injectable()
export class GameBoxStateError extends ComponentBase<GameBoxContext, StateImm> {
  public unsubscribe = new Subject<void>()
  public stateSubject
  public state

  constructor(
    private tryAgain: Button,
    @inject(TYPES.ErrorHandler) private errorHandler: ErrorHandler,
    @inject(TYPES.Game) private game: Game,
    @inject(TYPES.Remote) private remote: Remote,
  ) {
    super()

    this.stateSubject = new BehaviorSubject<StateImm>(
      fromJS({
        error: null,
      }),
    )

    this.state = this.stateSubject.asObservable()
  }

  onInit() {
    this.tryAgain.setProps({
      classes: "btn--play-again btn-box__btn",
      content: "Try Again",
    })

    this.game.error
      .pipe(
        distinctUntilChanged((previous, current) =>
          R.equals(previous, current),
        ),
        tap((error) => {
          this.stateSubject.next(
            this.stateSubject
              .getValue()
              .set("error", fromJS(this.errorHandler.handle(error))),
          )
        }),
      )
      .subscribe()
  }

  onMounted() {
    fromEvent(document, "click")
      .pipe(
        takeUntil(this.unsubscribe),
        filter((event) => {
          const target = event.target as HTMLElement
          return target.classList.contains("btn--play-again")
        }),
        tap(() => {
          this.remote.replay()
          this.props.setState("start")
        }),
      )
      .subscribe()
  }

  onUpdated() {}

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
      tryAgain: this.tryAgain.render(),
    })
  }
}
