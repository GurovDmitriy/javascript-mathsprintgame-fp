import { is } from "immutable"
import * as R from "ramda"
import {
  BehaviorSubject,
  distinctUntilChanged,
  Observable,
  Subject,
  takeUntil,
  tap,
} from "rxjs"
import { container } from "../../compositionRoot/container"
import { TYPES } from "../../compositionRoot/types"
import type { Children, ComponentStateful } from "../../interface"
import { Sweeper } from "./Sweeper"

export abstract class ComponentBase<TProps = any, TState = any>
  implements ComponentStateful<TProps, TState>
{
  #sweeper = container.get<Sweeper>(TYPES.Sweeper)
  #unsubscribe: Subject<void>

  public parentId: string
  public parentAttr: string
  public parentAttrId: string

  abstract props: () => TProps
  abstract stateSubject: BehaviorSubject<TState>
  abstract state: Observable<TState>

  protected constructor() {
    this.#unsubscribe = new Subject<void>()

    const attrGenerated = this._attrGenerator()
    this.parentId = attrGenerated.id
    this.parentAttr = attrGenerated.attr
    this.parentAttrId = attrGenerated.value

    this._cleaner()
    this._stateUpdated()
  }

  abstract setProps(cb: () => TProps): this
  abstract children(state: BehaviorSubject<TState>): Children[]
  abstract render(): string

  onMounted(): void {}
  onUpdated(): void {}
  onDestroy(): void {}

  mount(): void {
    queueMicrotask(() => {
      R.pipe(
        () => this._elementFinder(),
        R.ifElse(
          (elementParent: Element | null) => Boolean(elementParent),
          (elementParent) => {
            ;(elementParent as Element).innerHTML = this.render()

            requestAnimationFrame(() => {
              this.onMounted()

              queueMicrotask(() => {
                this._mountChildren()
              })
            })
          },
          R.T,
        ),
      )()
    })
  }

  destroy(): void {
    queueMicrotask(() => {
      this.onDestroy()
    })

    queueMicrotask(() => {
      const children = this.children(this.stateSubject)

      R.ifElse(
        () => R.and(Boolean, R.complement(R.isEmpty))(children),
        () => {
          R.forEach((c) => {
            const child = c as Children
            child.destroy()
          }, R.values(children))
        },
        R.T,
      )()

      this.#unsubscribe.next()
      this.#unsubscribe.complete()
    })
  }

  private _cleaner() {
    this.#sweeper.state
      .pipe(
        takeUntil(this.#unsubscribe),
        tap(() => {
          if (!this._elementFinder()) {
            this.destroy()
          }
        }),
      )
      .subscribe()
  }

  private _stateUpdated(): void {
    queueMicrotask(() => {
      this.state
        .pipe(
          takeUntil(this.#unsubscribe),
          distinctUntilChanged((prev: any, curr: any) => is(prev, curr)),
          tap(() => {
            queueMicrotask(() => {
              R.pipe(
                () => this._elementFinder(),
                R.ifElse(
                  (elementParent: Element | null) => Boolean(elementParent),
                  (elementParent) => {
                    ;(elementParent as Element).innerHTML = this.render()
                    this.#sweeper.sweep()

                    requestAnimationFrame(() => {
                      this.onUpdated()
                    })

                    queueMicrotask(() => {
                      this._mountChildren()
                    })
                  },
                  R.T,
                ),
              )()
            })
          }),
        )
        .subscribe()
    })
  }

  private _mountChildren(): void {
    const children = this.children(this.stateSubject)

    queueMicrotask(() => {
      R.ifElse(
        () => R.and(Boolean, R.complement(R.isEmpty))(children),
        () => {
          R.forEach((c) => {
            const child = c as Children
            child.mount()
          }, R.values(children))
        },
        R.T,
      )()
    })
  }

  private _elementFinder(): Element | null {
    if (document) {
      return document.querySelector(`[${this.parentAttrId}]`)
    } else {
      return null
    }
  }

  private _attrGenerator(): { attr: string; id: string; value: string } {
    const attr = "data-brainful-parent-id"
    const id = `brainful-${crypto.randomUUID()}`
    const value = `${attr}=${id}`

    return {
      attr,
      id,
      value,
    }
  }
}
