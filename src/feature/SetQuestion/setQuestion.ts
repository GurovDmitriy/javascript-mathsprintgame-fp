import { catchError, filter, fromEvent, map, Observable, of, tap } from "rxjs"

export class SetQuestion {
  #form: Element

  constructor() {
    const element = document.querySelector(".navigation__form")
    if (!element) throw Error("No found element")

    this.#form = element
  }

  execute(): Observable<number> {
    return fromEvent(this.#form, "click").pipe(
      filter(this.isElementQuestionBox),
      map(this.getCount),
      tap((event) => {
        console.log(event)
      }),
      catchError((error) => {
        return of(error)
      }),
    )
  }

  private getCount(event: Event): number {
    const target = event.target as HTMLElement
    if (!target) throw Error("No found element")

    const element = target.querySelector<HTMLInputElement>(".input-box__input")
    if (!element) throw Error("No found element")

    return Number.parseInt(element.value)
  }

  private isElementQuestionBox(event: Event): boolean {
    const target = event.target as HTMLElement
    if (!target) throw Error("No found element")

    return target.classList.contains("input-box")
  }
}
