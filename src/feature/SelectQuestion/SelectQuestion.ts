import { inject, injectable } from "inversify"
import {
  catchError,
  distinctUntilChanged,
  filter,
  fromEvent,
  map,
  of,
  tap,
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
export class SelectQuestion implements Component {
  private rootElement: Element
  private errorService: ErrorHandler
  private game: Game
  private remote: Remote

  constructor(
    @inject(TYPES.RootElement) rootElement: RootElement,
    @inject(TYPES.ErrorHandler) errorHandler: ErrorHandler,
    @inject(TYPES.Game) game: Game,
    @inject(TYPES.Remote) remote: Remote,
  ) {
    this.errorService = errorHandler
    this.rootElement = rootElement.element
    this.remote = remote
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

        return target.classList.contains("input-box")
      }),
      map((event) => {
        const target = event.target as HTMLElement
        if (!target) throw Error("No found element")

        const element =
          target.querySelector<HTMLInputElement>(".input-box__input")
        if (!element) throw Error("No found element")

        return Number.parseInt(element.value)
      }),
      tap((questionCount) => this.remote.choice(questionCount)),
      catchError((error) => {
        this.errorService.handle(error)
        return of(error)
      }),
    )
  }

  render() {
    return this.game.state.pipe(
      distinctUntilChanged(
        (previous, current) => previous.questionValue === current.questionValue,
      ),
      tap(() => {
        const inputs = document.querySelectorAll(".input-box__input")
        inputs.forEach((i) =>
          i.parentElement?.classList.remove("input-box--active"),
        )
      }),
      map((data) => {
        return document.getElementById(`value-${data.questionValue}`)
      }),
      tap((elementActive) => {
        elementActive?.parentElement?.classList.add("input-box--active")
      }),
    )
  }
}
