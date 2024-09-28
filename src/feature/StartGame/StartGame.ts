import { inject, injectable } from "inversify"
import { catchError, filter, fromEvent, of, pairwise, tap } from "rxjs"
import { TYPES } from "../../app/CompositionRoot/types"
import { GameMathSprint } from "../../domain/Game"
import type { Component, ErrorHandler, RootElement } from "../../interfaces"

@injectable()
export class StartGame implements Component {
  private rootElement: Element
  private errorService: ErrorHandler
  private game: GameMathSprint

  constructor(
    @inject(TYPES.RootElement) rootElement: RootElement,
    @inject(TYPES.ErrorHandler) errorService: ErrorHandler,
    game: GameMathSprint,
  ) {
    this.errorService = errorService
    this.rootElement = rootElement.element
    this.game = game
  }

  init() {
    this.handle().subscribe()
    this.render().subscribe()
  }

  destroy() {}

  handle() {
    return fromEvent(this.rootElement, "click").pipe(
      filter((event) => {
        const target = event.target as HTMLElement
        if (!target) throw Error("No found element")

        return target.classList.contains("btn--start")
      }),
      tap(() => this.game.play()),
      catchError((error) => {
        this.errorService.handle(error)
        return of(error)
      }),
    )
  }

  render() {
    return this.game.state.pipe(
      pairwise(),
      filter(([prev, current]) => !prev.active && current.active),
      tap(() => {
        const pageSplash = document.getElementById("splash-page")
        if (pageSplash) {
          pageSplash.hidden = true
        }
      }),
    )
  }
}
