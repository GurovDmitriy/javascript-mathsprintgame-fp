import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  Observable,
  Subject,
  takeUntil,
  tap,
} from "rxjs"
import { ComponentStateful } from "../../interface/Component"

export abstract class ComponentBase<TProps = any, TState = any>
  implements ComponentStateful<TProps, TState>
{
  public readonly idParent: string
  public readonly idParentAttr: string

  public props: TProps = {} as TProps

  abstract unsubscribe: Subject<void>
  abstract stateSubject: BehaviorSubject<TState>
  abstract state: Observable<TState>
  public children: ComponentStateful[] = []

  constructor() {
    this.idParent = this._idGenerator()
    this.idParentAttr = `data-painful-idparent="${this.idParent}"`
  }

  setProps(props: TProps) {
    this.props = props
  }

  create(): void {
    queueMicrotask(() => {
      this._init()
    })

    this._renderTemplateOnCreateInstance()
    this._renderTemplateAfterStateUpdated()

    if (typeof this.onCreate === "function") {
      this.onCreate()
    }
  }

  destroy(): void {
    queueMicrotask(() => {
      this.unsubscribe.next()
      this.unsubscribe.complete()

      if (typeof this.onDestroy === "function") {
        requestAnimationFrame(() => {
          this.onDestroy()
        })
      }
    })
  }

  onInit() {}
  onCreate() {}
  onDestroy() {}
  onMounted() {}
  onUpdated() {}
  abstract render(): string

  private _idGenerator(): string {
    return crypto.randomUUID()
  }

  private _renderTemplateOnCreateInstance() {
    queueMicrotask(() => {
      const elementParent = document.querySelector(
        `[data-painful-idparent="${this.idParent}"]`,
      )

      if (elementParent) {
        elementParent.innerHTML = this.render()
        requestAnimationFrame(() => {
          this._mount()
        })
      }
    })
  }

  private _renderTemplateAfterStateUpdated() {
    queueMicrotask(() => {
      this.state
        .pipe(
          takeUntil(this.unsubscribe),
          distinctUntilChanged((prev, curr) => Object.is(prev, curr)),
          debounceTime(80),
          tap(() => {
            queueMicrotask(() => {
              const elementParent = document.querySelector(
                `[data-painful-idparent="${this.idParent}"]`,
              )

              if (elementParent) {
                elementParent.innerHTML = this.render()
                requestAnimationFrame(() => {
                  this._update()
                })
              }
            })
          }),
        )
        .subscribe()
    })
  }

  private _init() {
    if (this.children.length) {
      this.children.forEach((c) => c.create())
    }

    if (typeof this.onInit === "function") {
      this.onInit()
    }
  }

  private _mount() {
    if (typeof this.onMounted === "function") {
      this.onMounted()
    }
  }

  private _update() {
    if (typeof this.onUpdated === "function") {
      this.onUpdated()
    }
  }
}
