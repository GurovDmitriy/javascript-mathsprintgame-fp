import { BehaviorSubject, Observable, Subject } from "rxjs"

export interface ComponentStateful<TProps = any, TState = any> {
  idParent: string
  idParentAttr: string
  unsubscribe: Subject<void>
  stateSubject: BehaviorSubject<TState>
  state: Observable<TState>
  children?: ComponentStateful[]
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
