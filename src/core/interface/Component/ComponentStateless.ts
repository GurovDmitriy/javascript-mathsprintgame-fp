export interface ComponentStateless<TProps = any> {
  setProps(props: TProps): void
  render(): string
}
