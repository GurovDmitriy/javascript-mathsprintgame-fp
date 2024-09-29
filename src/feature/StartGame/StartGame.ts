import { inject, injectable } from "inversify"
import {
  catchError,
  filter,
  finalize,
  fromEvent,
  of,
  switchMap,
  take,
  tap,
  timer,
} from "rxjs"
import { TYPES } from "../../app/CompositionRoot/types"
import type {
  Component,
  ErrorHandler,
  Game,
  Remote,
  RootElement,
} from "../../interfaces"

@injectable()
export class StartGame implements Component {
  private rootElement: Element
  private errorService: ErrorHandler
  private game: Game
  private remote: Remote

  constructor(
    @inject(TYPES.RootElement) rootElement: RootElement,
    @inject(TYPES.RootElement) errorHandler: ErrorHandler,
    @inject(TYPES.Game) game: Game,
    @inject(TYPES.Remote) remote: Remote,
  ) {
    this.errorService = errorHandler
    this.rootElement = rootElement.element
    this.game = game
    this.remote = remote
  }

  init() {
    this.handle().subscribe()
    this.render()
  }

  destroy() {}

  handle() {
    return fromEvent(this.rootElement, "click").pipe(
      filter((event) => {
        const target = event.target as HTMLElement
        if (!target) throw Error("No found element")

        return target.classList.contains("btn--start")
      }),
      take(1),
      tap(() => {
        const pageSplash = document.getElementById("splash-page")
        const pageCountdown = document.getElementById("countdown-page")
        if (pageSplash && pageCountdown) {
          pageSplash.hidden = true
          pageCountdown.hidden = false
        }
      }),
      switchMap(() => {
        return timer(0, 1000).pipe(
          take(5),
          tap((count) => {
            const elementCountdown = document.querySelector(
              ".countdown__caption",
            )
            if (elementCountdown) {
              elementCountdown.textContent = String(3 - count)
            }
          }),
        )
      }),
      finalize(() => {
        const pageCountdown = document.getElementById("countdown-page")
        const pageGame = document.getElementById("game-page")
        if (pageCountdown && pageGame) {
          pageCountdown.hidden = true
          pageGame.hidden = false

          this.remote.start()
        }
      }),
      catchError((error) => {
        this.errorService.handle(error)
        return of(error)
      }),
    )
  }

  render() {}
}
