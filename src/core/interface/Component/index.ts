import { BehaviorSubject, Observable, Subject } from "rxjs"

export type Children<TNames extends string> = {
  [K in TNames]: {
    value: K
    component: ComponentStateful
  }
}

export interface ComponentStateful<
  TProps = any,
  TState = any,
  TChildren extends string = any,
> {
  idParent: string
  idParentAttr: string
  unsubscribe: Subject<void>
  stateSubject: BehaviorSubject<TState>
  state: Observable<TState>
  children?: Children<TChildren>
  setProps(props: TProps): void
  create(): void
  destroy(): void
  onCreate?(): void
  onInit?(): void
  onMounted?(): void
  onUpdated?(): void
  onDestroy?(): void
  render(): string
}

export interface ComponentStateless<TProps> {
  setProps(props: TProps): void
  render(): string
}
