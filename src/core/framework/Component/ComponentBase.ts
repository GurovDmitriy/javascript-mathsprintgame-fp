import { is } from "immutable"
import { inject, injectable } from "inversify"
import * as R from "ramda"
import { complement } from "ramda"
import {
  BehaviorSubject,
  distinctUntilChanged,
  Observable,
  Subject,
  takeUntil,
  tap,
} from "rxjs"
import { TYPES } from "../../compositionRoot/types"
import type { Children, ComponentStateful, Sweeper } from "../../interface"

// TODO: stateInit - stateClear sweep
// TODO: bind - unbind container
// TODO: crate - destroy control
// TODO: children control
// TODO: lifecycle create init
// TODO: update state call sweep
// TODO: update state call sweep
// TODO: keep alive
// TODO: abstract class
// TODO: no container deps
@injectable()
export class ComponentBase<
  TProps = any,
  TState = any,
  TChildren extends string = any,
> implements ComponentStateful<TProps, TState, TChildren>
{
  public readonly idParent: string
  public readonly idParentAttr: string

  public props: TProps = {} as TProps

  public unsubscribe: Subject<void>
  private _unsubscribe: Subject<void>
  public stateSubject: BehaviorSubject<TState>
  public state: Observable<TState>
  public children: Children<TChildren> = {} as Children<TChildren>

  constructor(@inject(TYPES.Sweeper) private _blinder: Sweeper) {
    this.idParent = this._idGenerator()
    this.idParentAttr = `data-brainful-idparent="${this.idParent}"`

    this.unsubscribe = new Subject<void>()
    this._unsubscribe = new Subject<void>()
    this.stateSubject = new BehaviorSubject<TState>({} as TState)
    this.state = this.stateSubject.asObservable()

    if (this._blinder) {
      this._blinder.state
        .pipe(
          takeUntil(this._unsubscribe),
          tap(() => {
            const re = document.querySelector(
              `[data-brainful-idparent="${this.idParent}"]`,
            )
            if (!re) {
              this._blinder.sweep(this)
            }
          }),
        )
        .subscribe()
    }
  }

  setProps(props: TProps) {
    this.props = props
  }

  create(): void {
    this._create()
  }

  destroy(): void {
    this._destroy()
  }

  render() {
    return ""
  }

  onCreate() {}
  onInit() {}
  onMounted() {}
  onUpdated() {}
  onDestroy() {}

  private _create() {
    this._destroy()

    queueMicrotask(() => {
      this._init()
    })

    this._renderTemplateOnCreateInstance()
    this._renderTemplateAfterStateUpdated()

    this.onCreate()
  }

  private _destroy() {
    queueMicrotask(() => {
      this.unsubscribe.next()
      this.unsubscribe.complete()
      this.unsubscribe = new Subject<void>()

      this._unsubscribe.next()
      this._unsubscribe.complete()
      this._unsubscribe = new Subject<void>()

      if (this.children) {
        R.forEach((c) => {
          const child = c as { value: string; component: ComponentStateful }
          child.component.destroy()
        }, R.values(this.children))
      }

      requestAnimationFrame(() => {
        this.onDestroy()
      })
    })
  }

  private _init() {
    R.ifElse(
      () => R.and(Boolean, complement(R.isEmpty))(this.children),
      () => {
        R.forEach((c) => {
          const child = c as { value: string; component: ComponentStateful }
          child.component.create()
        }, R.values(this.children))
      },
      R.T,
    )()

    this.onInit()
  }

  private _mount() {
    this.onMounted()
  }

  private _update() {
    this.onUpdated()
  }

  private _render() {
    return this.render()
  }

  private _renderTemplateOnCreateInstance() {
    queueMicrotask(() => {
      R.pipe(
        () =>
          document.querySelector(`[data-brainful-idparent="${this.idParent}"]`),
        R.ifElse(
          (elementParent: Element | null) => Boolean(elementParent),
          (elementParent) => {
            ;(elementParent as Element).innerHTML = this.render()
            requestAnimationFrame(() => {
              this._mount()
            })
          },
          R.T,
        ),
      )()
    })
  }

  private _renderTemplateAfterStateUpdated() {
    queueMicrotask(() => {
      this.state
        .pipe(
          takeUntil(this._unsubscribe),
          distinctUntilChanged((prev: any, curr: any) => is(prev, curr)),
          tap(() => {
            queueMicrotask(() => {
              R.pipe(
                () =>
                  document.querySelector(
                    `[data-brainful-idparent="${this.idParent}"]`,
                  ),
                R.ifElse(
                  (elementParent: Element | null) => Boolean(elementParent),
                  (elementParent) => {
                    ;(elementParent as Element).innerHTML = this._render()
                    requestAnimationFrame(() => {
                      this._update()

                      if (this._blinder?.update) {
                        this._blinder.update()
                      }
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

  private _idGenerator(): string {
    return crypto.randomUUID()
  }
}
