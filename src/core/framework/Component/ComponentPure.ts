import { is } from "immutable"
import * as R from "ramda"
import { distinctUntilChanged, skip, Subject, takeUntil, tap } from "rxjs"
import { container } from "../../compositionRoot/container.js"
import { TYPES } from "../../compositionRoot/types.js"
import type {
  ComponentStateful,
  ComponentStateless,
  DomFinder,
  IdGenerator,
} from "../../interface/index.js"

export abstract class ComponentPure<TProps = any>
  implements ComponentStateless<TProps>
{
  #idGenerator = container.get<IdGenerator>(TYPES.ComponentId)
  #domFinder = container.get<DomFinder>(TYPES.ElementFinder)

  #unsubscribe: Subject<void>
  #id: string
  #host: Element
  #parent: ComponentStateful | undefined
  #props: () => TProps

  protected constructor() {
    this.#unsubscribe = new Subject<void>()
    this.#id = this.#idGenerator.generate()
    this.#host = document.createElement("div")
    this.#parent = undefined
    this.#props = () => ({}) as TProps
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

  mount(): void {
    queueMicrotask(() => {
      R.pipe(
        R.ifElse(
          (parentElement: Element | null) => Boolean(parentElement),
          (parentElement) => {
            this.#host.innerHTML = this.render()
            ;(parentElement as Element).replaceChildren(this.#host)

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

      this.#unsubscribe.next()
      this.#unsubscribe.complete()
      this.#unsubscribe = undefined!
      this.#host = undefined!
      this.#parent = undefined!
      this.#props = undefined!
      this.#id = undefined!
      this.#idGenerator = undefined!
      this.#domFinder = undefined!
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
