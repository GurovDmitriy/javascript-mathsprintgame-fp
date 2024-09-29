import { inject, injectable } from "inversify"
import { catchError, fromEvent, of, take, tap } from "rxjs"
import { TYPES } from "../../app/CompositionRoot/types"
import type {
  Component,
  ErrorHandler,
  Game,
  Remote,
  RootElement,
} from "../../interfaces"

@injectable()
export class QuizPass implements Component {
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
    this.render().subscribe()
  }

  destroy() {}

  handle() {
    return fromEvent(this.rootElement, "click").pipe(
      // filter((event) => {
      //   const target = event.target as HTMLElement
      //   if (!target) throw Error("No found element")
      //
      //   return target.classList.contains("btn--start")
      // }),
      take(1),
      tap(() => {
        console.log("click")
      }),
      catchError((error) => {
        this.errorService.handle(error)
        return of(error)
      }),
    )
  }

  render() {
    return this.game.state.pipe(
      tap((data) => {
        console.log(data)
      }),
    )
  }
}
