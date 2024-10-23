import { compile } from "handlebars"
import { fromJS, FromJS } from "immutable"
import { inject, injectable } from "inversify"
import * as R from "ramda"
import {
  BehaviorSubject,
  catchError,
  filter,
  fromEvent,
  Observable,
  of,
  Subject,
  takeUntil,
  tap,
  withLatestFrom,
} from "rxjs"
import { TYPES } from "../../app/compositionRoot/types"
import { ComponentBase } from "../../core/framework/Component"
import { Children } from "../../core/interface/Component"
import type { ErrorHandler, Game, Remote } from "../../interfaces"
import { Button } from "../../shared/components/Button"
import { delegate } from "../../shared/tools/delegate"
import { SelectQuestion } from "../SelectQuestion"
import { GameBoxContext } from "./types"

interface State {}

type StateImm = FromJS<State>

@injectable()
export class GameBoxStateStart extends ComponentBase<GameBoxContext, StateImm> {
  public unsubscribe: Subject<void>
  public stateSubject: BehaviorSubject<StateImm>
  public state: Observable<StateImm>
  public children: Children<"selectQuestion">

  constructor(
    private selectQuestion: SelectQuestion,
    private startRound: Button,
    @inject(TYPES.ErrorHandler) private _errorHandler: ErrorHandler,
    @inject(TYPES.Game) private game: Game,
    @inject(TYPES.Remote) private remote: Remote,
  ) {
    super()

    this.unsubscribe = new Subject<void>()

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
    this._handleSetProps()
  }

  onMounted() {
    this._handleStartGame()
  }

  private _handleSetProps(): void {
    this.startRound.setProps({
      classes: "btn--start btn-box__btn",
      content: "Start Round",
    })
  }

  private _handleStartGame(): void {
    fromEvent(document, "click")
      .pipe(
        takeUntil(this.unsubscribe),
        delegate("btn--start"),
        withLatestFrom(this.game.state),
        tap(() => {
          this.remote.start()
        }),
        filter((state) => {
          return R.gt(state[1].get("questionValue") as number, 0)
        }),
        tap(() => {
          this.props.setState("countdown")
        }),
        catchError((error) => {
          this._errorHandler.handle(error)
          return of(error)
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
