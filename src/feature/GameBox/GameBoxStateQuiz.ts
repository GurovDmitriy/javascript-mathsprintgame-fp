import { Children, ComponentBase } from "@brainfuljs/brainful"
import { FromJS, fromJS } from "immutable"
import { inject, injectable } from "inversify"
import M from "mustache"
import * as R from "ramda"
import {
  BehaviorSubject,
  catchError,
  filter,
  fromEvent,
  map,
  Observable,
  of,
  Subject,
  take,
  takeUntil,
  tap,
} from "rxjs"
import { containerApp } from "../../app/compositionRoot/container.ts"
import { TYPES } from "../../app/compositionRoot/types.ts"
import type { ErrorHandler, Game, GameEquation, Remote } from "../../interfaces"
import { Button } from "../../shared/components/Button"
import { childrenIterator } from "../../shared/tools/childrenIterator.ts"
import { delegate } from "../../shared/tools/delegate.ts"
import { GameBoxContext } from "./types.ts"

interface State {
  equations: {
    left: number
    right: number
    result: number
    classActive: string
  }[]
  children: {
    btnRight: {
      component: Button
    }
    btnWrong: {
      component: Button
    }
  }
}

type StateImm = FromJS<State>

@injectable()
export class GameBoxStateQuiz extends ComponentBase<GameBoxContext, StateImm> {
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
        equations: [],
        children: {
          btnRight: {
            component: containerApp.get(Button).setProps(() => ({
              classes: "btn--right btn-quiz-box__btn",
              content: "Right",
            })),
          },
          btnWrong: {
            component: containerApp.get(Button).setProps(() => ({
              classes: "btn--wrong btn-quiz-box__btn",
              content: "Wrong",
            })),
          },
        },
      }),
    )

    this.state = this.stateSubject.asObservable()

    this._handleAnswerActive()
    this._handleToggleState()
    this._handleBtnAnswer()
  }

  onDestroy() {
    this.unsubscribe.next()
    this.unsubscribe.complete()
    this.stateSubject.complete()
  }

  onUpdated() {
    this._handleScrollContainer()
  }

  children(): { forEach: (cb: (c: Children) => void) => void } {
    return childrenIterator(this.stateSubject)
  }

  private _handleAnswerActive() {
    this._game.state
      .pipe(
        takeUntil(this.unsubscribe),
        tap((data) => {
          const equations = data.toJS().equations as GameEquation[]
          const active = data.toJS().equationActive as number

          this.stateSubject.next(
            this.stateSubject.getValue().set(
              "equations",
              fromJS(
                equations.map((e, index) => ({
                  left: e.values[0],
                  right: e.values[1],
                  result: e.result,
                  classActive: index === active ? "quiz__item--active" : "",
                })),
              ),
            ),
          )
        }),
      )
      .subscribe()
  }

  private _handleToggleState() {
    this._game.state
      .pipe(
        takeUntil(this.unsubscribe),
        filter((data) => {
          return R.equals(data.get("end") as unknown as boolean, true)
        }),
        take(1),
        tap(() => {
          this.props.setState("score")
        }),
      )
      .subscribe()
  }

  private _handleBtnAnswer() {
    const tapRemote = R.ifElse(
      (answer: "wrong" | "right") => R.equals(answer, "wrong"),
      () => this._remote.wrong(),
      () => this._remote.right(),
    )

    fromEvent<KeyboardEvent>(document, "keydown")
      .pipe(
        takeUntil(this.unsubscribe),
        map(
          R.ifElse(
            (e) => R.equals("ArrowLeft", e.key),
            () => "wrong" as const,
            () => "right" as const,
          ),
        ),
        tap(tapRemote),
      )
      .subscribe()

    fromEvent<Event>(this.host, "click")
      .pipe(
        takeUntil(this.unsubscribe),
        delegate("btn-quiz-box__btn"),
        map(
          R.ifElse(
            (e: Event) =>
              (e.target as HTMLElement).classList.contains("btn--wrong"),
            () => "wrong" as const,
            () => "right" as const,
          ),
        ),
        tap(tapRemote),
        catchError((error) => {
          this._errorHandler.handle(error)
          return of(error)
        }),
      )
      .subscribe()
  }

  private _handleScrollContainer() {
    const ele = document.querySelector(".quiz__item--active")
    if (ele) {
      queueMicrotask(() => {
        ele.scrollIntoView({ block: "center" })
      })
    }
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
            <!-- quiz view -->
              <div class="quiz fieldset__quiz">
                <div>
                  {{#state.equations}}
                  <p class="quiz__item {{classActive}}">
                     {{left}} <span>x</span> {{right}} <span>=</span> {{result}}
                  </p>
                  {{/state.equations}}
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
           <div class="btn-quiz-box btn-box__btn-quiz-box">
             <div data-b-key="{{state.children.btnWrong.component.id}}"></div>
             <div data-b-key="{{state.children.btnRight.component.id}}"></div>
          </div>
        </section>
      </header>
    `

    return M.render(template, {
      state: this.stateSubject.getValue().toJS(),
    })
  }
}
