import { compile } from "handlebars"
import { FromJS, fromJS } from "immutable"
import { inject, injectable } from "inversify"
import {
  BehaviorSubject,
  catchError,
  filter,
  fromEvent,
  map,
  of,
  Subject,
  takeUntil,
  tap,
} from "rxjs"
import { TYPES } from "../../app/compositionRoot/types"
import { ComponentBase } from "../../core/framework/Component"
import type { ErrorHandler, Game, GameEquation, Remote } from "../../interfaces"
import { Button } from "../../shared/components/Button"
import { GameBoxContext } from "./types"

interface State {
  equations: {
    left: number
    right: number
    result: number
    classActive: string
  }[]
}

type StateImm = FromJS<State>

@injectable()
export class GameBoxStateQuiz extends ComponentBase<GameBoxContext, StateImm> {
  public unsubscribe = new Subject<void>()
  public stateSubject
  public state

  constructor(
    private btnWrong: Button,
    private btnRight: Button,
    @inject(TYPES.ErrorHandler) private errorHandler: ErrorHandler,
    @inject(TYPES.Game) private game: Game,
    @inject(TYPES.Remote) private remote: Remote,
  ) {
    super()

    this.stateSubject = new BehaviorSubject<StateImm>(
      fromJS({
        equations: [],
      }),
    )

    this.state = this.stateSubject.asObservable()
  }

  onInit() {
    this.btnWrong.setProps({
      classes: "btn--wrong btn-quiz-box__btn",
      content: "Wrong",
    })

    this.btnRight.setProps({
      classes: "btn--right btn-quiz-box__btn",
      content: "Right",
    })

    this.game.state
      .pipe(
        takeUntil(this.unsubscribe),
        filter((data) => {
          return data.get("end") === true
        }),
        tap(() => {
          this.props.setState("score")
        }),
      )
      .subscribe()

    this.game.state
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

  onMounted() {
    fromEvent(document, "click")
      .pipe(
        takeUntil(this.unsubscribe),
        filter((event) => {
          const target = event.target as HTMLElement
          return target.classList.contains("btn-quiz-box__btn")
        }),
        map((event) => {
          const target = event.target as HTMLElement
          return target.classList.contains("btn--wrong") ? "wrong" : "right"
        }),
        tap((typeAnswer) => {
          if (typeAnswer === "wrong") {
            this.remote.wrong()
          } else {
            this.remote.right()
          }
        }),
        catchError((error) => {
          this.errorHandler.handle(error)
          return of(error)
        }),
      )
      .subscribe()
  }

  onUpdated() {
    const ele = document.querySelector(".quiz__item--active")
    if (ele) {
      queueMicrotask(() => {
        ele.scrollIntoView({ block: "center" })
      })
    }
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
            <!-- quiz view -->
              <div class="quiz fieldset__quiz">
                <div>
                  {{#each state.equations}}
                  <p class="quiz__item {{this.classActive}}">
                     {{this.left}} <span>x</span> {{this.right}} <span>=</span> {{this.result}}
                  </p>
                  {{/each}}
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
             {{{btnWrong}}}
             {{{btnRight}}}
          </div>
        </section>
      </header>
    `)

    return template({
      state: this.stateSubject.getValue().toJS(),
      btnWrong: this.btnWrong.render(),
      btnRight: this.btnRight.render(),
    })
  }
}
