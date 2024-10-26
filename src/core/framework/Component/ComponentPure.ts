import { ComponentStateless } from "../../interface/Component"

export abstract class ComponentPure<TProps = any>
  implements ComponentStateless<TProps>
{
  public props: TProps = {} as TProps

  protected constructor() {}

  setProps(props: TProps) {
    this.props = props
  }

  abstract render(): string
}
