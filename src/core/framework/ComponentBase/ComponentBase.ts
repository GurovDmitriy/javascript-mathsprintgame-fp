import { injectable } from "inversify"
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

interface Options<TState> {
  stateInit: TState
}

@injectable()
export abstract class ComponentBase<TProps = any, TState = any>
  implements ComponentStateful<TProps, TState>
{
  /**
   * Init state for start state Observe
   */
  public readonly stateInit: TState

  /**
   * ID of the parent element for rendering.
   * When a Root or another component uses child components,
   * it must insert this identifier into the element with the data-painful-idparent attribute
   * so that the component can render itself in that element.
   */
  public readonly idParent: string

  /**
   * ID Attribute helper as string data-painful-idparent="value".
   */
  public readonly idParentAttr: string

  /**
   * Component props.
   * Props are not a trigger for re-rendering the component.
   * If they need to be changed, you should change the state of the parent,
   * which in turn configures the props of the component used in the render function.
   */
  public props: TProps

  /**
   * Local state of the component.
   * State is a trigger for re-rendering the component.
   * If you set the state, the component will re-render.
   */
  public readonly stateSubject
  public readonly state: Observable<TState>

  /**
   * Control for unsubscribing from observables in the component.
   */
  public readonly unsubscribe = new Subject<void>()

  constructor(options: Options<TState>) {
    this.idParent = this.idGenerator()
    this.idParentAttr = `data-painful-idparent="${this.idParent}"`

    this.props = {} as TProps
    this.stateInit = options.stateInit

    this.stateSubject = new BehaviorSubject<TState>(options.stateInit)
    this.state = this.stateSubject.asObservable()

    this.create()
  }

  /**
   * Generate id for parent container.
   */
  private idGenerator(): string {
    return crypto.randomUUID()
  }

  /**
   * Set the props of the component.
   * Props are not a trigger for re-rendering the component.
   * If they need to be changed, you should change the state of the parent,
   * which in turn configures the props of the component used in the render function.
   */
  setProps(props: TProps) {
    this.props = props
  }

  /**
   * Called during the creation phase of the component.
   * Invoked directly in the constructor of the component for the first time
   * and again when manually calling the create method.
   */
  create(): void {
    this._renderTemplateOnCreateInstance()
    this._renderTemplateAfterStateUpdated()
  }

  /**
   * Append string html template in dom
   * Work in component instance once and
   * after your call create() method
   */
  private _renderTemplateOnCreateInstance() {
    queueMicrotask(() => {
      this.onInit()
    })

    queueMicrotask(() => {
      const elementParent = document.querySelector(
        `[data-painful-idparent="${this.idParent}"]`,
      )

      if (elementParent) {
        elementParent.innerHTML = this.render()

        requestAnimationFrame(() => {
          if (elementParent) {
            this.onMounted()
          }
        })
      }
    })
  }

  /**
   * Append string html template in dom after state changed
   */
  private _renderTemplateAfterStateUpdated() {
    /**
     * Core rerender with low level control.
     */
    this.state
      .pipe(
        takeUntil(this.unsubscribe),
        distinctUntilChanged((prev, curr) => Object.is(prev, curr)),
        debounceTime(80),
        tap(() => {
          requestAnimationFrame(() => {
            const elementParent = document.querySelector(
              `[data-painful-idparent="${this.idParent}"]`,
            )

            if (elementParent) {
              elementParent.innerHTML = this.render()

              requestAnimationFrame(() => {
                this.onUpdated()
              })
            }
          })
        }),
      )
      .subscribe()
  }

  /**
   * Manual control for destroying the component.
   * After destruction, call create if the component is returned to DOM.
   */
  destroy(): void {
    requestAnimationFrame(() => {
      this.unsubscribe.next()
      this.unsubscribe.complete()
    })
  }

  /**
   * Called during the initialization phase of the component.
   * Invoked directly in the constructor of the component for the first time
   * and again when manually calling the create method.
   * Here, it is allowed to read local or global state to prepare
   * data for rendering templates or perform other non-DOM related tasks.
   */
  onInit(): void {}

  /**
   * Called after init, after the template has been inserted into DOM.
   * Here you can start working with state mutations and event delegation handlers.
   */
  onMounted(): void {}

  /**
   * Called when the component triggers a re-render.
   * This usually happens when the component's state changes.
   */
  onUpdated(): void {}

  /**
   * The framework uses this method to get HTML as a string.
   * Use Mustache or Handlebars to process your templates.
   * In this method, you can set props for child components or return
   * rendered output for child components if they are used in the current template.
   */
  abstract render(): string
}
