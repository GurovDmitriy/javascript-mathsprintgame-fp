import { ComponentStateful } from "./ComponentStateful.js"

export interface ComponentStateless<TProps = any> {
  id: string
  host: Element
  parent: ComponentStateful | undefined
  props: TProps
  setProps(cb: () => TProps): this
  setParent(parent: ComponentStateful | undefined): this
  mount(): void
  destroy(): void
  onMounted(): void
  onUpdated(): void
  onDestroy(): void
  render(): string
}
