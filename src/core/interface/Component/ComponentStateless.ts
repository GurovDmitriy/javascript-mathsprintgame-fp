export interface ComponentStateless<TProps = any> {
  parentId: string
  parentAttr: string
  parentAttrId: string
  props(): TProps
  setProps(cb: () => TProps): this
  mount(): void
  destroy(): void
  onMounted(): void
  onDestroy(): void
  render(): string
}
