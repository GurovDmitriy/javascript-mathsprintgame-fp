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
import type { ComponentStateful } from "../../interface"
import { Sweeper } from "./Sweeper"

// TODO: lifecycle hooks order!!!

// TODO: stateInit - stateClear sweep
// TODO: check how state init is create on bind and unbind log it
// TODO: keep alive as blinder

// TODO: sweeper as cleaner
// TODO: bind - unbind container
// TODO: update state call sweep
// TODO: update state call sweep
// TODO: async destroy/unbind

// TODO: crate - destroy control
// TODO: children control
// TODO: lifecycle create init

// TODO: abstract class
// TODO: no container deps

// TODO: merge streams for state & children
export abstract class ComponentBase<TProps = any, TState = any, TChildren = any>
  implements ComponentStateful<TProps, TState, TChildren>
{
  private _unsubscribe: Subject<void> = new Subject<void>()

  public parentId: string
  public parentAttr: string
  public parentAttrId: string

  public props: TProps = {} as TProps
  public children: TChildren

  abstract unsubscribe: Subject<void>
  abstract stateSubject: BehaviorSubject<TState>
  abstract state: Observable<TState>

  private _sweeper = container.get<Sweeper>(TYPES.Sweeper)

  protected constructor() {
    const attrGenerated = this._attrGenerator()
    this.parentId = attrGenerated.id
    this.parentAttr = attrGenerated.attr
    this.parentAttrId = attrGenerated.value

    this.props = {} as TProps
    this.children = {} as TChildren

    this._sweeper.state
      .pipe(
        takeUntil(this._unsubscribe),
        tap(() => {
          if (this._elementFinder() === null) {
            // TODO: check sbs component
            // TODO: check sbs local
            // TODO: check memory
            // TODO: check and remove all this links - state and sbs and children
            this.destroy()
            console.log("call to check render")
          }
        }),
      )
      .subscribe()

    this._mountComponentAfterStateUpdate()
  }

  setProps(props: TProps): void {
    this.props = props
  }

  mount(): void {
    this._mountComponent()
  }

  // deprecate
  create(): void {}

  destroy(): void {
    queueMicrotask(() => {
      this.onDestroy()
    })

    queueMicrotask(() => {
      this._destroyChildren()
      this._unsubscribe.next()
      this._unsubscribe.complete()
    })
  }

  abstract render(): string

  // deprecate
  onCreate(): void {}
  // deprecate
  onInit(): void {}

  onMounted(): void {}
  onUpdated(): void {}
  onDestroy(): void {}

  private _mountComponent(): void {
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

  private _mountComponentAfterStateUpdate(): void {
    queueMicrotask(() => {
      this.state
        .pipe(
          takeUntil(this._unsubscribe),
          distinctUntilChanged((prev: any, curr: any) => is(prev, curr)),
          tap(() => {
            queueMicrotask(() => {
              R.pipe(
                () => this._elementFinder(),
                R.ifElse(
                  (elementParent: Element | null) => Boolean(elementParent),
                  (elementParent) => {
                    ;(elementParent as Element).innerHTML = this.render()

                    // TODO: replate innerHtml

                    requestAnimationFrame(() => {
                      this.onUpdated()
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

  // private _initCleanerNotifier(): void {
  //   this._cleaner.stream
  //     .pipe(
  //       takeUntil(this._unsubscribe),
  //       tap(() => {
  //         const element = this._helperElementFinder()
  //         if (!element) {
  //           this._cleaner.sweep(() => this as any)
  //         }
  //       }),
  //     )
  //     .subscribe()
  // }

  private _mountChildren(): void {
    // queueMicrotask(() => {
    //   R.ifElse(
    //     () => R.and(Boolean, complement(R.isEmpty))(this.children),
    //     () => {
    //       R.forEach((c) => {
    //         const child = c as { value: string; component: ComponentStateful }
    //         child.component.mount()
    //       }, R.values(this.children))
    //     },
    //     R.T,
    //   )()
    // })
  }

  private _destroyChildren(): void {
    // R.ifElse(
    //   () => R.and(Boolean, complement(R.isEmpty))(this.children),
    //   () => {
    //     R.forEach((c) => {
    //       const child = c as { value: string; component: ComponentStateful }
    //       child.component.destroy()
    //     }, R.values(this.children))
    //   },
    //   R.T,
    // )()
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
