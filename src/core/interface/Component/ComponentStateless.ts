export interface ComponentStateless<TProps = any> {
  parentId: string
  parentAttr: string
  parentAttrId: string
  setProps(props: TProps): void
  mount(): void
  destroy(): void
  onMounted(): void
  onDestroy(): void
  render(): string
}
