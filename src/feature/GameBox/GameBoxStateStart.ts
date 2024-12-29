import { Children, ComponentBase } from "@brainfuljs/brainful"
import { fromJS, FromJS } from "immutable"
import { inject, injectable } from "inversify"
import M from "mustache"
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
import { containerApp } from "../../app/compositionRoot/container.ts"
import { TYPES } from "../../app/compositionRoot/types.ts"
import type { ErrorHandler, Game, Remote } from "../../interfaces"
import { Button } from "../../shared/components/Button"
import { childrenIterator } from "../../shared/tools/childrenIterator.ts"
import { delegate } from "../../shared/tools/delegate.ts"
import { SelectQuestion } from "../SelectQuestion"
import { GameBoxContext } from "./types.ts"

interface State {
  children: {
    selectQuestion: {
      component: SelectQuestion
    }
    startRound: {
      component: Button
    }
  }
}

type StateImm = FromJS<State>

@injectable()
export class GameBoxStateStart extends ComponentBase<GameBoxContext, StateImm> {
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
        children: {
          selectQuestion: {
            component: containerApp.get(SelectQuestion),
          },
          startRound: {
            component: containerApp.get(Button).setProps(() => ({
              classes: "btn--start btn-box__btn",
              content: "Start Round",
            })),
          },
        },
      }),
    )
    this.state = this.stateSubject.asObservable()

    this._handleStartGame()
  }

  onDestroy() {
    console.log("on destroy")
    this.unsubscribe.next()
    this.unsubscribe.complete()
    this.stateSubject.complete()
  }

  children(): { forEach: (cb: (c: Children) => void) => void } {
    return childrenIterator(this.stateSubject)
  }

  private _handleStartGame(): void {
    fromEvent(this.host, "click")
      .pipe(
        takeUntil(this.unsubscribe),
        delegate("btn--start"),
        withLatestFrom(this._game.state),
        tap(() => {
          this._remote.start()
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
    const template = `
      <header class="header game__header">
        <h1 class="header__caption">Math Sprint Game</h1>

        <!-- nav -->
        <nav class="navigation header__navigation">
          <h2 class="navigation__caption visually-hidden">
            Navigation for Game
          </h2>

          <form class="form navigation__form">
            <div class="form__fieldset-wrapper" data-b-key="{{selectQuestion.id}}">
            </div>
            <button class="btn form__btn visually-hidden" type="submit" disabled>
              Play
            </button>
          </form>
        </nav>
        <!-- Button -->
        <section class="btn-box form__btn-box">
          <h2 class="btn-box__caption visually-hidden">Play Buttons</h2>
          <div data-b-key="{{startRound.id}}"></div>
        </section>
      </header>
    `

    return M.render(template, {
      selectQuestion: this.stateSubject
        .getValue()
        .getIn(["children", "selectQuestion", "component"]),
      startRound: this.stateSubject
        .getValue()
        .getIn(["children", "startRound", "component"]),
    })
  }
}
