import { compile } from "handlebars"
import { fromJS, FromJS } from "immutable"
import { inject, injectable } from "inversify"
import {
  BehaviorSubject,
  catchError,
  distinctUntilChanged,
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
import type { ErrorHandler, Game, Remote } from "../../interfaces"

interface State {
  questions: { classSelected: string; value: number; record: number }[]
}

type StateImm = FromJS<State>

@injectable()
export class SelectQuestion extends ComponentBase<any, StateImm> {
  public unsubscribe = new Subject<void>()
  public stateSubject
  public state

  constructor(
    @inject(TYPES.ErrorHandler) private errorHandler: ErrorHandler,
    @inject(TYPES.Game) private game: Game,
    @inject(TYPES.Remote) private remote: Remote,
  ) {
    super()

    this.stateSubject = new BehaviorSubject<StateImm>(
      fromJS({
        questions: [],
      }),
    )

    this.state = this.stateSubject.asObservable()
  }

  onInit() {
    this.game.state
      .pipe(
        takeUntil(this.unsubscribe),
        distinctUntilChanged(
          (previous, current) =>
            previous.get("questionValue") === current.get("questionValue"),
        ),
        tap((state) => {
          const stateRaw = state.toJS()

          const questions = this.game.config.get("questions").map((q) => {
            return {
              classSelected:
                state.get("questionValue") === q ? "input-box--active" : "",
              value: q,
              record: stateRaw.score[String(q)] || 0,
            }
          })

          this.stateSubject.next(
            this.stateSubject.getValue().set("questions", fromJS(questions)),
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
          return target.classList.contains("input-box")
        }),
        map((event) => {
          const target = event.target as HTMLElement
          return Number.parseInt(target.dataset.question as string)
        }),
        tap((questionCount) => this.remote.choice(questionCount)),
        catchError((error) => {
          this.errorHandler.handle(error)
          return of(error)
        }),
      )
      .subscribe()
  }

  render() {
    const template = compile(`
      <fieldset class="fieldset form__fieldset" id="splash-page">
        <legend class="fieldset__legend">Questions</legend>
        <div class="questions fieldset__questions">
          {{#each state.questions}}
            <div class="input-box questions__input-box {{this.classSelected}}" data-question="{{this.value}}">
              <label class="input-box__label" for="value-{{this.value}}" tabindex="{{@index}}">
                <span>{{this.value}} Questions</span>
                <div class="best-score input-box__best-score">
                  <h3 class="best-score__caption">Best Score</h3>
                  <strong class="best-score__value">{{this.record}}</strong>
                </div></label
              >
              <input
                class="input-box__input visually-hidden"
                type="radio"
                name="questions"
                value="{{this.value}}"
                id="value-{{this.value}}"
              />
            </div>
          {{/each}}
        </div>
      </fieldset>
    `)

    return template({ state: this.stateSubject.getValue().toJS() })
  }
}
