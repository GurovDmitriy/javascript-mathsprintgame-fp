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

@injectable()
export abstract class ComponentBase<TProps = any, TState = any>
  implements ComponentStateful<TProps, TState>
{
  /**
   * ID of the parent element for rendering.
   * When a Root or another component uses child components,
   * it must insert this identifier into the element with the data-painful-idparent attribute
   * so that the component can render itself in that element.
   */
  public readonly idParent: string

  /**
   * ID Attribute helper as string data-painful-idparent.
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
  protected readonly stateSubject
  public readonly state: Observable<TState>

  /**
   * Control for unsubscribing from observables in the component.
   */
  public readonly unsubscribe = new Subject<void>()

  constructor(initState: TState) {
    this.idParent = this.idGenerator()
    this.idParentAttr = `data-painful-idparent="${this.idParent}"`

    this.props = {} as TProps

    this.stateSubject = new BehaviorSubject<TState>(initState)
    this.state = this.stateSubject.asObservable()

    this.create()
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
    queueMicrotask(() => {
      this.init()
    })

    queueMicrotask(() => {
      const elementParent = document.querySelector(
        `[data-painful-idparent="${this.idParent}"]`,
      )

      if (elementParent) {
        elementParent.innerHTML = this.render()

        requestAnimationFrame(() => {
          if (elementParent) {
            this.mounted()
          }
        })
      }
    })

    /**
     * Core rerender with low level control.
     */
    this.state
      .pipe(
        takeUntil(this.unsubscribe),
        distinctUntilChanged((prev, curr) => Object.is(prev, curr)),
        debounceTime(100),
        tap(() => {
          requestAnimationFrame(() => {
            const elementParent = document.querySelector(
              `[data-painful-idparent="${this.idParent}"]`,
            )

            if (elementParent) {
              elementParent.innerHTML = this.render()

              requestAnimationFrame(() => {
                this.updated()
              })
            }
          })
        }),
      )
      .subscribe()
  }

  /**
   * Called during the initialization phase of the component.
   * Invoked directly in the constructor of the component for the first time
   * and again when manually calling the create method.
   * Here, it is allowed to read local or global state to prepare
   * data for rendering templates or perform other non-DOM related tasks.
   */
  init(): void {}

  /**
   * Called after init, after the template has been inserted into DOM.
   * Here you can start working with state mutations and event delegation handlers.
   */
  mounted(): void {}

  /**
   * Called when the component triggers a re-render.
   * This usually happens when the component's state changes.
   */
  updated(): void {}

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
   * The framework uses this method to get HTML as a string.
   * Use Mustache or Handlebars to process your templates.
   * In this method, you can set props for child components or return
   * rendered output for child components if they are used in the current template.
   */
  render(): string {
    return ""
  }

  /**
   * Generate id for parent container.
   */
  private idGenerator(): string {
    return crypto.randomUUID()
  }
}
