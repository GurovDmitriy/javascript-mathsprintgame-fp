import { injectable } from "inversify"
import type { ComponentStateless } from "../../interface"

@injectable()
export class ComponentPure<TProps = any> implements ComponentStateless<TProps> {
  public props: TProps = {} as TProps

  constructor() {}

  setProps(props: TProps) {
    this.props = props
  }

  render() {
    return ""
  }
}
