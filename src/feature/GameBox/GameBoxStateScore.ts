import { compile } from "handlebars"
import Immutable, { FromJS, fromJS } from "immutable"
import { inject, injectable } from "inversify"
import {
  BehaviorSubject,
  catchError,
  distinctUntilChanged,
  fromEvent,
  Observable,
  of,
  Subject,
  takeUntil,
  tap,
} from "rxjs"
import { TYPES } from "../../app/compositionRoot/types"
import { ComponentBase } from "../../core/framework/Component"
import type { ErrorHandler, Game, GameResult, Remote } from "../../interfaces"
import { Button } from "../../shared/components/Button"
import { delegate } from "../../shared/tools/delegate"
import { GameBoxContext } from "./types"

interface State {
  final: number
  base: number
  penalty: number
}

type StateImm = FromJS<State>

@injectable()
export class GameBoxStateScore extends ComponentBase<GameBoxContext, StateImm> {
  public unsubscribe: Subject<void>
  public stateSubject: BehaviorSubject<StateImm>
  public state: Observable<StateImm>

  constructor(
    public readonly playAgain: Button,
    @inject(TYPES.ErrorHandler) private _errorHandler: ErrorHandler,
    @inject(TYPES.Game) private _game: Game,
    @inject(TYPES.Remote) private _remote: Remote,
  ) {
    super()

    this.unsubscribe = new Subject<void>()

    this.stateSubject = new BehaviorSubject<StateImm>(
      fromJS({
        final: 0,
        base: 0,
        penalty: 0,
      }),
    )

    this.state = this.stateSubject.asObservable()
  }

  onInit(): void {
    this._handleSetProps()
    this._handleResult()
  }

  onMounted(): void {
    this._handleReplay()
  }

  private _handleSetProps(): void {
    this.playAgain.setProps({
      classes: "btn--play-again btn-box__btn",
      content: "Play Again",
    })
  }

  private _handleResult(): void {
    this._game.state
      .pipe(
        distinctUntilChanged((previous, current) =>
          Immutable.is(previous.get("result"), current.get("result")),
        ),
        tap((state) => {
          const resultRaw = state.toJS().result as GameResult

          this.stateSubject.next(
            this.stateSubject.getValue().merge(
              fromJS({
                final: resultRaw.total,
                base: resultRaw.base,
                penalty: resultRaw.penalty,
              }),
            ),
          )
        }),
        catchError((error) => {
          this._errorHandler.handle(error)
          return of(error)
        }),
      )
      .subscribe()
  }

  private _handleReplay(): void {
    fromEvent(document, "click")
      .pipe(
        takeUntil(this.unsubscribe),
        delegate("btn--play-again"),
        tap(() => {
          this._remote.replay()
          this.props.setState("start")
        }),
        catchError((error) => {
          this._errorHandler.handle(error)
          return of(error)
        }),
      )
      .subscribe()
  }

  render(): string {
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
              <!-- Score View -->
              <div class="fieldset form__fieldset" id="score-page">
                <!-- Score Container -->
                <div class="score fieldset__score">
                  <table class="table-score score__table-score">
                    <tr class="score__item score__item--title">
                      <th colspan="2"><h3>Your Time</h3></th>
                    </tr>
                    <tr class="table-score__item table-score__item--final-time">
                      <th>Final</th>
                      <td>{{state.final}}</td>
                    </tr>
                    <tr class="table-score__item table-score__item--base-time">
                      <th>Base</th>
                      <td>{{state.base}}</td>
                    </tr>
                    <tr
                      class="table-score__item table-score__item--penalty-time"
                    >
                      <th>Penalty</th>
                      <td>{{state.penalty}}</td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
          </form>
        </nav>
        <!-- Button -->
        <section class="btn-box form__btn-box">
          <h2 class="btn-box__caption visually-hidden">Play Buttons</h2>
           <div class="btn-quiz-box btn-box__btn-quiz-box">
             {{{playAgain}}}
          </div>
        </section>
      </header>
    `)

    return template({
      state: this.stateSubject.getValue().toJS(),
      playAgain: this.playAgain.render(),
    })
  }
}
