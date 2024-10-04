import { compile } from "handlebars"
import { inject, injectable } from "inversify"
import { filter, fromEvent, takeUntil, tap, withLatestFrom } from "rxjs"
import { TYPES } from "../../app/compositionRoot/types"
import { ComponentBase } from "../../core/framework/ComponentBase"
import type { Game } from "../../interfaces"
import { Button } from "../../shared/components/Button"
import { SelectQuestion } from "../SelectQuestion"
import { GameBoxContext } from "./types"

@injectable()
export class GameBoxStateStart extends ComponentBase<GameBoxContext> {
  constructor(
    private selectQuestion: SelectQuestion,
    private startRound: Button,
    @inject(TYPES.Game) private game: Game,
  ) {
    super({
      stateInit: {},
    })
  }

  onMounted() {
    fromEvent(document, "click")
      .pipe(
        takeUntil(this.unsubscribe),
        filter((event) => {
          const target = event.target as HTMLElement
          return target.classList.contains("btn--start")
        }),
        withLatestFrom(this.game.state),
        filter((state) => {
          return state[1].questionValue > 0
        }),
        tap(() => {
          this.props.setStateCountdown()
        }),
      )
      .subscribe()
  }

  render() {
    this.startRound.setProps({
      classes: "btn--start btn-box__btn",
      content: "Start Round",
    })

    const template = compile(`
      <header class="header game__header">
        <h1 class="header__caption">Math Sprint Game</h1>

        <!-- nav -->
        <nav class="navigation header__navigation">
          <h2 class="navigation__caption visually-hidden">
            Navigation for Game
          </h2>

          <form class="form navigation__form">
            <div class="form__fieldset-wrapper" {{{idParentAttrSelectQuestion}}}>
            <!-- splash page -->
            {{{selectQuestion}}}
            </div>
            <button class="btn form__btn visually-hidden" type="submit" disabled>
              Play
            </button>
          </form>
        </nav>
        <!-- Button -->
        <section class="btn-box form__btn-box">
          <h2 class="btn-box__caption visually-hidden">Play Buttons</h2>
          {{{startRound}}}
        </section>
      </header>
    `)

    return template({
      idParentAttrSelectQuestion: this.selectQuestion.idParentAttr,
      selectQuestion: this.selectQuestion.render(),
      startRound: this.startRound.render(),
    })
  }
}
