import { compile } from "handlebars"
import { inject, injectable } from "inversify"
import {
  catchError,
  distinctUntilChanged,
  filter,
  fromEvent,
  map,
  of,
  takeUntil,
  tap,
} from "rxjs"
import { TYPES } from "../../app/compositionRoot/types"
import { ComponentBase } from "../../core/framework/ComponentBase"
import type { ErrorHandler, Game, Remote } from "../../interfaces"

interface State {
  questions: { classSelected: string; value: number }[]
}

@injectable()
export class SelectQuestion extends ComponentBase<any, State> {
  constructor(
    @inject(TYPES.ErrorHandler) private errorHandler: ErrorHandler,
    @inject(TYPES.Game) private game: Game,
    @inject(TYPES.Remote) private remote: Remote,
  ) {
    super({
      questions: [{ classSelected: "", value: 0 }],
    })
  }

  init() {
    this.game.state
      .pipe(
        takeUntil(this.unsubscribe),
        distinctUntilChanged(
          (previous, current) =>
            previous.questionValue === current.questionValue,
        ),
        tap((state) => {
          this.stateSubject.next({
            ...this.stateSubject.getValue(),
            questions: this.game.config.questions.map((q) => {
              return {
                classSelected:
                  state.questionValue === q ? "input-box--active" : "",
                value: q,
              }
            }),
          })
        }),
      )
      .subscribe()
  }

  mounted() {
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
          {{#each questions}}
            <div class="input-box questions__input-box {{this.classSelected}}" data-question="{{this.value}}">
              <label class="input-box__label" for="value-{{this.value}}" tabindex="{{@index}}">
                <span>{{this.value}} Questions</span>
                <div class="best-score input-box__best-score">
                  <h3 class="best-score__caption">Best Score</h3>
                  <strong class="best-score__value">0</strong>
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

    return template({ questions: this.stateSubject.getValue().questions })
  }
}
