import { BehaviorSubject, Observable, Subject } from "rxjs"
import { Children } from "./Children.js"

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
  onInit?(): void
  onCreate?(): void
  onMounted?(): void
  onUpdated?(): void
  onDestroy?(): void
  render(): string
}
