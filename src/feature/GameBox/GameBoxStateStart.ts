import { compile } from "handlebars"
import { fromJS, FromJS } from "immutable"
import { inject, injectable } from "inversify"
import {
  BehaviorSubject,
  filter,
  fromEvent,
  Subject,
  takeUntil,
  tap,
  withLatestFrom,
} from "rxjs"
import { TYPES } from "../../app/compositionRoot/types"
import { ComponentBase } from "../../core/framework/Component"
import type { ErrorHandler, Game, Remote } from "../../interfaces"
import { Button } from "../../shared/components/Button"
import { SelectQuestion } from "../SelectQuestion"
import { GameBoxContext } from "./types"

interface State {}

type StateImm = FromJS<State>

@injectable()
export class GameBoxStateStart extends ComponentBase<GameBoxContext, StateImm> {
  public unsubscribe = new Subject<void>()
  public stateSubject
  public state
  public children

  constructor(
    private selectQuestion: SelectQuestion,
    private startRound: Button,
    @inject(TYPES.Game) private game: Game,
    @inject(TYPES.Remote) private remote: Remote,
    @inject(TYPES.ErrorHandler) private errorHandler: ErrorHandler,
  ) {
    super()

    this.children = {
      selectQuestion: {
        value: "selectQuestion",
        component: this.selectQuestion,
      },
    }

    this.stateSubject = new BehaviorSubject<StateImm>(fromJS({}))

    this.state = this.stateSubject.asObservable()
  }

  onInit() {
    this.startRound.setProps({
      classes: "btn--start btn-box__btn",
      content: "Start Round",
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
        tap(() => {
          this.remote.start()
        }),
        filter((state) => {
          return (state[1].get("questionValue") as number) > 0
        }),
        tap(() => {
          this.props.setState("countdown")
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
            <div class="form__fieldset-wrapper" {{{idParentAttrSelectQuestion}}}>
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
      startRound: this.startRound.render(),
    })
  }
}
