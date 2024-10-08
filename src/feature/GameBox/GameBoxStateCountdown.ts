import { compile } from "handlebars"
import { fromJS, FromJS } from "immutable"
import { injectable } from "inversify"
import {
  BehaviorSubject,
  finalize,
  Subject,
  take,
  takeUntil,
  tap,
  timer,
} from "rxjs"
import { ComponentBase } from "../../core/framework/Component"
import { GameBoxContext } from "./types"

interface State {
  timer: number
}

type StateImm = FromJS<State>

@injectable()
export class GameBoxStateCountdown extends ComponentBase<
  GameBoxContext,
  StateImm
> {
  public unsubscribe = new Subject<void>()
  public stateSubject
  public state

  constructor() {
    super()

    this.stateSubject = new BehaviorSubject<StateImm>(
      fromJS({
        timer: 3,
      }),
    )

    this.state = this.stateSubject.asObservable()
  }

  getState() {
    return this.stateSubject.getValue()
  }

  onMounted() {
    timer(0, 1000)
      .pipe(
        takeUntil(this.unsubscribe),
        take(4),
        tap((count: number) => {
          this.stateSubject.next(
            this.stateSubject.getValue().set("timer", 3 - count),
          )
        }),
        finalize(() => {
          this.props.setState("quiz")
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
            <div class="form__fieldset-wrapper">
            <!-- countdown page -->
              <fieldset
                class="fieldset form__fieldset"
                id="countdown-page"
              >
                <legend class="fieldset__legend">Countdown</legend>
                <div class="countdown fieldset__countdown">
                  <h3 class="countdown__caption">{{state.timer}}</h3>
                  <div class="contdown__control-table-box">
                    <table class="control-table coutdown__control-table">
                      <tr>
                        <th colspan="2">controls</th>
                      </tr>
                      <tr>
                        <td>
                          <kbd>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              class="bi bi-arrow-left-square"
                              viewBox="0 0 16 16"
                            >
                              <path
                                fill-rule="evenodd"
                                d="M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm11.5 5.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5z"
                              />
                            </svg>
                            <span class="visually-hidden">left arrow</span>
                          </kbd>
                        </td>
                        <td>
                          <kbd>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              class="bi bi-arrow-right-square"
                              viewBox="0 0 16 16"
                            >
                              <path
                                fill-rule="evenodd"
                                d="M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm4.5 5.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H4.5z"
                              />
                            </svg>
                            <span class="visually-hidden">right arrow</span>
                          </kbd>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <kbd>w</kbd>
                        </td>
                        <td>
                          <kbd>r</kbd>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2">
                          <kbd>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              class="bi bi-mouse2"
                              viewBox="0 0 16 16"
                            >
                              <path
                                d="M3 5.188C3 2.341 5.22 0 8 0s5 2.342 5 5.188v5.625C13 13.658 10.78 16 8 16s-5-2.342-5-5.188V5.189zm4.5-4.155C5.541 1.289 4 3.035 4 5.188V5.5h3.5V1.033zm1 0V5.5H12v-.313c0-2.152-1.541-3.898-3.5-4.154zM12 6.5H4v4.313C4 13.145 5.81 15 8 15s4-1.855 4-4.188V6.5z"
                              />
                            </svg>
                            <span class="visually-hidden">mouse</span>
                          </kbd>
                        </td>
                      </tr>
                    </table>
                  </div>
                </div>
              </fieldset>
            </div>
            <button class="btn form__btn visually-hidden" type="submit" disabled>
              Play
            </button>
          </form>
        </nav>
        <!-- Button -->
        <section class="btn-box form__btn-box">
          <h2 class="btn-box__caption visually-hidden">Play Buttons</h2>
        </section>
      </header>
    `)

    return template({ state: this.stateSubject.getValue().toJS() })
  }
}
