import { is } from "immutable"
import * as R from "ramda"
import {
  distinctUntilChanged,
  filter,
  mergeMap,
  Observable,
  skip,
  Subject,
  take,
  takeUntil,
  tap,
} from "rxjs"
import { container } from "../../compositionRoot/container.js"
import { TYPES } from "../../compositionRoot/types.js"
import type {
  ComponentStateful,
  ComponentStateless,
  DomFinder,
  IdGenerator,
} from "../../interface/index.js"

type EventName = "setParent"

interface Events {
  event: EventName
}

export abstract class ComponentPure<TProps = any>
  implements ComponentStateless<TProps>
{
  #idGenerator = container.get<IdGenerator>(TYPES.ComponentId)
  #domFinder = container.get<DomFinder>(TYPES.ElementFinder)

  #unsubscribe: Subject<void>
  #eventsSubject: Subject<Events>
  #events: Observable<Events>

  #id: string
  #host: Element
  #parent: ComponentStateful | undefined
  #slick: () => boolean
  #props: () => TProps

  protected constructor() {
    this.#unsubscribe = new Subject<void>()
    this.#eventsSubject = new Subject<Events>()
    this.#events = this.#eventsSubject.asObservable()

    this.#id = this.#idGenerator.generate()
    this.#host = document.createElement("div")
    this.#parent = undefined
    this.#slick = () => false
    this.#props = () => ({}) as TProps

    this._handleCleaner()
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

  setSlick(cb: () => boolean): this {
    this.#slick = cb
    return this
  }

  setParent(parent: ComponentStateful | undefined): this {
    R.ifElse(
      () => R.not(Boolean(this.#parent)),
      () => {
        this.#parent = parent

        this.#eventsSubject.next({
          event: "setParent",
        })
      },
      R.T,
    )()

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

            queueMicrotask(() => {
              requestAnimationFrame(() => {
                this.onMounted()
              })
            })
          },
          R.T,
        ),
      )(this.#domFinder.find(this.#parent!.host, this.#id))
    })
  }

  destroy(): void {
    R.ifElse(
      () => this.#unsubscribe.observed,
      () => {
        queueMicrotask(() => {
          this.onDestroy()
        })

        queueMicrotask(() => {
          this.#unsubscribe.next()
          this.#unsubscribe.complete()
          this.#eventsSubject.complete()
          this.#host.innerHTML = ""
        })
      },
      R.T,
    )()
  }

  private _handleCleaner() {
    const parentSubscribe = () =>
      this.#parent!.state.pipe(
        takeUntil(this.#unsubscribe),
        skip(1),
        filter(() => R.not(this.#slick())),
        distinctUntilChanged((previous: any, current: any) =>
          is(previous, current),
        ),
        tap(() => {
          requestAnimationFrame(() => {
            R.ifElse(
              () => R.isNil(this.#domFinder.find(this.#parent!.host, this.id)),
              () => this.destroy(),
              R.T,
            )()
          })
        }),
      )

    this.#events
      .pipe(
        takeUntil(this.#unsubscribe),
        filter((evt) => R.equals("setParent", evt.event)),
        take(1),
        mergeMap(parentSubscribe),
      )
      .subscribe()
  }
}
