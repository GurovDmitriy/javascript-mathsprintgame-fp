import { compile } from "handlebars"
import { fromJS, FromJS } from "immutable"
import { inject, injectable } from "inversify"
import * as R from "ramda"
import {
  BehaviorSubject,
  catchError,
  distinctUntilChanged,
  fromEvent,
  map,
  Observable,
  of,
  Subject,
  takeUntil,
  tap,
} from "rxjs"
import { TYPES } from "../../app/compositionRoot/types"
import { ComponentBase } from "../../core/framework/Component"
import { Children } from "../../core/interface"
import type { ErrorHandler, Game, Remote } from "../../interfaces"
import { delegate } from "../../shared/tools/delegate"

interface State {
  questions: { classSelected: string; value: number; record: number }[]
}

type StateImm = FromJS<State>

@injectable()
export class SelectQuestion extends ComponentBase<any, StateImm> {
  public unsubscribe: Subject<void>
  public stateSubject: BehaviorSubject<StateImm>
  public state: Observable<StateImm>
  public children: Children<{}> = {}

  constructor(
    @inject(TYPES.ErrorHandler) private _errorHandler: ErrorHandler,
    @inject(TYPES.Game) private _game: Game,
    @inject(TYPES.Remote) private _remote: Remote,
  ) {
    super()

    this.unsubscribe = new Subject<void>()

    this.stateSubject = new BehaviorSubject<StateImm>(
      fromJS({
        questions: [],
      }),
    )

    this.state = this.stateSubject.asObservable()
    this._handleQuizFormat()

    console.log("constructor", this)
  }

  onMounted() {
    this._handleSelectQuestions()
  }

  onDestroy() {
    this.unsubscribe.next()
    this.unsubscribe.complete()
  }

  private _handleSelectQuestions() {
    fromEvent(document, "click")
      .pipe(
        takeUntil(this.unsubscribe),
        delegate("input-box"),
        map((event) => {
          return Number.parseInt(
            (event.target as HTMLElement).dataset.question as string,
          )
        }),
        tap((questionCount) => this._remote.choice(questionCount)),
        catchError((error) => {
          this._errorHandler.handle(error)
          return of(error)
        }),
      )
      .subscribe()
  }

  private _handleQuizFormat() {
    this._game.state
      .pipe(
        takeUntil(this.unsubscribe),
        distinctUntilChanged((previous, current) =>
          R.equals(previous.get("questionValue"), current.get("questionValue")),
        ),
        tap((state) => {
          const stateInit = {
            questionValue: state.get("questionValue") as unknown as number,
            stateRaw: state.toJS() as { score: Record<string, number> },
            questions: this._game.config.get(
              "questions",
            ) as unknown as number[],
            questionsFormatted: [] as State[],
          }

          R.pipe(
            (state: typeof stateInit) => {
              return R.assoc(
                "questionsFormatted",
                R.map((question: number) => {
                  return {
                    classSelected: R.ifElse(
                      (value: number) => R.equals(value, question),
                      () => "input-box--active",
                      () => "",
                    )(state.questionValue),
                    value: question,
                    record: R.or(state.stateRaw.score[String(question)], 0),
                  }
                }, state.questions),
                state,
              )
            },
            (state) => {
              this.stateSubject.next(
                this.stateSubject
                  .getValue()
                  .set("questions", fromJS(state.questionsFormatted)),
              )
            },
          )(stateInit)
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
