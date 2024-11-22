import { is } from "immutable"
import * as R from "ramda"
import {
  BehaviorSubject,
  distinctUntilChanged,
  Observable,
  skip,
  Subject,
  takeUntil,
  tap,
} from "rxjs"
import { container } from "../../compositionRoot/container.js"
import { TYPES } from "../../compositionRoot/types.js"
import type {
  Children,
  ComponentStateful,
  DomFinder,
  IdGenerator,
} from "../../interface/index.js"

export abstract class ComponentBase<TProps = any, TState = any>
  implements ComponentStateful<TProps, TState>
{
  #idGenerator = container.get<IdGenerator>(TYPES.ComponentId)
  #domFinder = container.get<DomFinder>(TYPES.ElementFinder)

  #unsubscribe: Subject<void>
  #id: string
  #host: Element
  #hostTemp: Element
  #parent: ComponentStateful | undefined
  #props: () => TProps

  abstract stateSubject: BehaviorSubject<TState>
  abstract state: Observable<TState>

  protected constructor() {
    this.#unsubscribe = new Subject<void>()
    this.#id = this.#idGenerator.generate()
    this.#host = document.createElement("div")
    this.#hostTemp = document.createElement("div")
    this.#parent = undefined
    this.#props = () => ({}) as TProps

    this._stateUpdated()
  }

  abstract render(): string

  onMounted(): void {}
  onUpdated(): void {}
  onDestroy(): void {}

  get id(): string {
    return this.#id
  }

  get host(): Element {
    return this.#host
  }

  get parent(): ComponentStateful | undefined {
    return this.#parent
  }

  get props(): TProps {
    return this.#props()
  }

  setParent(parent: ComponentStateful | undefined): this {
    if (this.#parent) return this

    this.#parent = parent
    this._cleaner()
    return this
  }

  setProps(cb: () => TProps): this {
    this.#props = cb
    return this
  }

  children(): { forEach: (cb: (c: Children) => void) => void } {
    return []
  }

  mount(): void {
    queueMicrotask(() => {
      R.pipe(
        R.ifElse(
          (parentElement: Element | null) => Boolean(parentElement),
          (parentElement) => {
            this.#hostTemp.innerHTML = this.render()

            this.children().forEach((c: Children) => {
              c.setParent(this).mount()
            })

            this.#host.replaceChildren(...this.#hostTemp.childNodes)
            ;(parentElement as Element).replaceChildren(this.#host)
            this.#hostTemp.innerHTML = ""

            requestAnimationFrame(() => {
              this.onMounted()
            })
          },
          R.T,
        ),
      )(this.#domFinder.find(this.#parent!.host, this.#id))
    })
  }

  destroy(): void {
    queueMicrotask(() => {
      this.onDestroy()

      this.children().forEach((c: Children) => {
        c.destroy()
      })

      this.#unsubscribe.next()
      this.#unsubscribe.complete()
      this.#unsubscribe = undefined!
      this.#host = undefined!
      this.#hostTemp = undefined!
      this.#parent = undefined!
      this.#props = undefined!
      this.state = undefined!
      this.stateSubject = undefined!
      this.#id = undefined!
      this.#idGenerator = undefined!
      this.#domFinder = undefined!
    })
  }

  private _stateUpdated(): void {
    queueMicrotask(() => {
      this.state
        .pipe(
          skip(1),
          takeUntil(this.#unsubscribe),
          distinctUntilChanged((previous: any, current: any) =>
            is(previous, current),
          ),
          tap(() => {
            queueMicrotask(() => {
              this.#hostTemp.innerHTML = this.render()

              this.children().forEach((c: Children) => {
                c.setParent(this).mount()
              })

              this.#host.replaceChildren(...this.#hostTemp.childNodes)
              this.#hostTemp.innerHTML = ""

              requestAnimationFrame(() => {
                this.onUpdated()
              })
            })
          }),
        )
        .subscribe()
    })
  }

  private _cleaner() {
    this.#parent!.state.pipe(
      skip(1),
      takeUntil(this.#unsubscribe),
      distinctUntilChanged((previous: any, current: any) =>
        is(previous, current),
      ),
      tap(() => {
        requestAnimationFrame(() => {
          R.ifElse(
            () => R.isNil(this.#domFinder.find(this.parent!.host, this.id)),
            () => this.destroy(),
            R.T,
          )()
        })
      }),
    ).subscribe()
  }
}
