import { compile } from "handlebars"
import { FromJS, fromJS } from "immutable"
import { inject, injectable } from "inversify"
import {
  BehaviorSubject,
  filter,
  fromEvent,
  Subject,
  takeUntil,
  tap,
} from "rxjs"
import { TYPES } from "../../app/compositionRoot/types"
import { ComponentBase } from "../../core/framework/Component"
import type { ErrorHandler, Game, Remote } from "../../interfaces"
import { Button } from "../../shared/components/Button"
import { GameBoxContext } from "./types"

interface State {}

type StateImm = FromJS<State>

@injectable()
export class GameBoxStateScore extends ComponentBase<GameBoxContext, StateImm> {
  public unsubscribe = new Subject<void>()
  public stateSubject
  public state

  constructor(
    private playAgain: Button,
    @inject(TYPES.ErrorHandler) private errorHandler: ErrorHandler,
    @inject(TYPES.Game) private game: Game,
    @inject(TYPES.Remote) private remote: Remote,
  ) {
    super()

    this.stateSubject = new BehaviorSubject<StateImm>(fromJS({}))

    this.state = this.stateSubject.asObservable()
  }

  onInit() {
    this.playAgain.setProps({
      classes: "btn--play-again btn-box__btn",
      content: "Play Again",
    })
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
                      <th colspan="2"><h3>Your Time</h3></th>
                    </tr>
                    <tr class="table-score__item table-score__item--final-time">
                      <th>Final</th>
                      <td>0</td>
                    </tr>
                    <tr class="table-score__item table-score__item--base-time">
                      <th>Base</th>
                      <td>0</td>
                    </tr>
                    <tr
                      class="table-score__item table-score__item--penalty-time"
                    >
                      <th>Penalty</th>
                      <td>0</td>
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
             {{{playAgain}}}
          </div>
        </section>
      </header>
    `)

    return template({
      state: this.stateSubject.getValue().toJS(),
      playAgain: this.playAgain.render(),
    })
  }
}
