import { BehaviorSubject, Observable, Subject } from "rxjs"

export interface ComponentStateful<
  TProps = any,
  TState = any,
  TChildren = any,
> {
  parentId: string
  parentAttr: string
  parentAttrId: string
  unsubscribe: Subject<void>
  stateSubject: BehaviorSubject<TState>
  state: Observable<TState>
  children: TChildren
  setProps(props: TProps): void
  mount(): void
  create(): void
  destroy(): void
  onInit(): void
  onCreate(): void
  onMounted(): void
  onUpdated(): void
  onDestroy(): void
  render(): string
}
