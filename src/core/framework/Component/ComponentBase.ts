import { is } from "immutable"
import * as R from "ramda"
import {
  animationFrameScheduler,
  asapScheduler,
  BehaviorSubject,
  concatMap,
  distinctUntilChanged,
  filter,
  Observable,
  observeOn,
  queueScheduler,
  skip,
  Subject,
  take,
  takeUntil,
  tap,
} from "rxjs"
import { container } from "../../compositionRoot/container.ts"
import { TYPES } from "../../compositionRoot/types.ts"
import type {
  Children,
  ComponentStateful,
  DomFinder,
  IdGenerator,
} from "../../interface/index.ts"

type Event = EventSetParent | EventMount | EventDestroy

interface EventSetParent {
  name: "setParent"
  value: ComponentStateful
}

interface EventMount {
  name: "mount"
  value: null
}

interface EventDestroy {
  name: "destroy"
  value: null
}

export abstract class ComponentBase<TProps = any, TState = any>
  implements ComponentStateful<TProps, TState>
{
  #idGenerator = container.get<IdGenerator>(TYPES.ComponentId)
  #domFinder = container.get<DomFinder>(TYPES.ElementFinder)

  #unsubscribe: Subject<void>
  #eventsSubject: Subject<Event>
  #events: Observable<Event>

  #id: string
  #host: Element
  #parent: ComponentStateful | undefined
  #slick: () => boolean
  #props: () => TProps

  abstract stateSubject: BehaviorSubject<TState>
  abstract state: Observable<TState>

  protected constructor() {
    this.#unsubscribe = new Subject<void>()
    this.#eventsSubject = new Subject<Event>()
    this.#events = this.#eventsSubject.asObservable()

    this.#id = this.#idGenerator.generate()
    this.#host = document.createElement("div")
    this.#parent = undefined
    this.#slick = () => false
    this.#props = () => ({}) as TProps

    this._handleSetParent()
    this._handleMount()
    this._handleStateUpdated()
    this._handleDestroy()
    this._handleCleaner()

    console.log(1, "created", this.constructor.name, this.#id)
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

  get slick(): boolean {
    return this.#slick()
  }

  setSlick(cb: () => boolean): this {
    this.#slick = cb
    return this
  }

  setParent(parent: ComponentStateful): this {
    this.#eventsSubject.next({
      name: "setParent",
      value: parent,
    })

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
    this.#eventsSubject.next({ name: "mount", value: null })
  }

  destroy(): void {
    this.#eventsSubject.next({ name: "destroy", value: null })
  }

  private _handleSetParent() {
    this.#events
      .pipe(
        observeOn(queueScheduler),
        takeUntil(this.#unsubscribe),
        filter((evt) => R.equals("setParent", evt.name)),
        take(1),
        tap((evt) => {
          console.log(2, "_handleSetParent", this.constructor.name, this.#id)
          this.#parent = (evt as EventSetParent).value
        }),
      )
      .subscribe()
  }

  private _handleMount() {
    this.#events
      .pipe(
        observeOn(asapScheduler),
        takeUntil(this.#unsubscribe),
        filter((evt) => R.equals("mount", evt.name)),
        tap(() => {
          R.ifElse(
            (parentElement: Element | null) => Boolean(parentElement),
            (parentElement) => {
              console.log(3, "mount", this.constructor.name, this.#id)
              this.#host.innerHTML = this.render()
              ;(parentElement as Element).replaceChildren(this.#host)

              this.children().forEach((c: Children) => {
                c.setParent(this).mount()
              })

              requestAnimationFrame(() => {
                this.onMounted()
              })
            },
            R.T,
          )(this.#domFinder.find(this.#parent!.host, this.#id))
        }),
      )
      .subscribe()
  }

  private _handleStateUpdated(): void {
    queueMicrotask(() => {
      this.state
        .pipe(
          observeOn(asapScheduler),
          takeUntil(this.#unsubscribe),
          skip(1),
          distinctUntilChanged((previous: any, current: any) =>
            is(previous, current),
          ),
          tap(() => {
            console.log(4, "state updated", this.constructor.name, this.#id)
            this.#host.innerHTML = this.render()

            this.children().forEach((c: Children) => {
              c.setParent(this).mount()
            })

            requestAnimationFrame(() => {
              this.onUpdated()
            })
          }),
        )
        .subscribe()
    })
  }

  private _handleDestroy() {
    this.#events
      .pipe(
        observeOn(asapScheduler),
        takeUntil(this.#unsubscribe),
        filter((evt) => R.equals("destroy", evt.name)),
        tap(() => {
          console.log("destroy", this.constructor.name, this.#id)

          queueMicrotask(() => {
            this.onDestroy()
          })

          queueMicrotask(() => {
            R.ifElse(
              () => this.#unsubscribe.observed,
              () => {
                this.#unsubscribe.next()
                this.#unsubscribe.complete()
                this.#eventsSubject.complete()
                this.#host.innerHTML = ""
                this.#parent = undefined
              },
              R.T,
            )()
          })

          this.children().forEach((c: Children) => {
            c.destroy()
          })
        }),
      )
      .subscribe()
  }

  private _handleCleaner() {
    const parentSubscribe = () =>
      this.#parent!.state.pipe(
        observeOn(animationFrameScheduler),
        takeUntil(this.#unsubscribe),
        skip(1),
        filter(() => R.not(this.#slick())),
        tap(() => {
          R.ifElse(
            () => R.isNil(this.#domFinder.find(this.#parent!.host, this.id)),
            () => {
              console.log("call to destroy", this.constructor.name)
              this.destroy()
            },
            () => {
              console.log("not call destroy", this.constructor.name)
            },
          )()
        }),
      )

    this.#events
      .pipe(
        observeOn(animationFrameScheduler),
        takeUntil(this.#unsubscribe),
        filter((evt) => R.equals("setParent", evt.name)),
        take(1),
        concatMap(parentSubscribe),
      )
      .subscribe()
  }
}
