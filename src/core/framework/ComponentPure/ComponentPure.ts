import { injectable } from "inversify"
import { ComponentStateless } from "../../interface/Component"

@injectable()
export abstract class ComponentPure<TProps = any>
  implements ComponentStateless<TProps>
{
  /**
   * Component props.
   * Props are not a trigger for re-rendering the component.
   * If they need to be changed, you should change the state of the parent,
   * which in turn configures the props of the component used in the render function.
   */
  public props: TProps = {} as TProps

  constructor() {}

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
   * The framework uses this method to get HTML as a string.
   * Use Mustache or Handlebars to process your templates.
   * In this method, you can set props for child components or return
   * rendered output for child components if they are used in the current template.
   */
  render(): string {
    return ""
  }
}
