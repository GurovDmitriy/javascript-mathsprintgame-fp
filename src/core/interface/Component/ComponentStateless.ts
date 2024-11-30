import { ComponentStateful } from "./ComponentStateful.ts"

export interface ComponentStateless<TProps = any> {
  id: string
  host: Element
  parent: ComponentStateful | undefined
  props: TProps
  setSlick(cb: () => boolean): this
  setProps(cb: () => TProps): this
  setParent(parent: ComponentStateful | undefined): this
  mount(): void
  destroy(): void
  onMounted(): void
  onUpdated(): void
  onDestroy(): void
  render(): string
}
