import { compile } from "handlebars"
import { FromJS, fromJS } from "immutable"
import { inject, injectable } from "inversify"
import { BehaviorSubject, Subject, takeUntil, tap } from "rxjs"
import { TYPES } from "../../app/compositionRoot/types"
import { ComponentBase } from "../../core/framework/Component"
import type { Game } from "../../interfaces"
import { GameBoxContext } from "./types"

interface State {
  equations: { leftNum: number; rightNum: number; result: number }[]
}

type StateMap = FromJS<State>

@injectable()
export class GameBoxStateQuiz extends ComponentBase<GameBoxContext, StateMap> {
  public unsubscribe = new Subject<void>()
  public stateSubject
  public state

  constructor(@inject(TYPES.Game) private game: Game) {
    super()

    this.stateSubject = new BehaviorSubject<StateMap>(
      fromJS({
        equations: [],
      }),
    )

    this.state = this.stateSubject.asObservable()
  }

  onInit() {
    this.game.state
      .pipe(
        takeUntil(this.unsubscribe),
        tap((data) => {
          console.log(data)
        }),
      )
      .subscribe()
  }

  onMounted() {}

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
            <!-- quiz view -->
              <div class="quiz fieldset__quiz">
                <div>
                  <p class="quiz__item quiz__item--active">
                     2 <span>x</span> 2 <span>=</span> 4
                  </p>
                </div>
              </div>
            </div>
            <button class="btn form__btn visually-hidden" type="submit" disabled>
              Play
            </button>
          </form>
        </nav>
        <!-- Button -->
        <section class="btn-box form__btn-box">
          <h2 class="btn-box__caption visually-hidden">Play Buttons</h2>
        </section>
      </header>
    `)

    return template({})
  }
}
