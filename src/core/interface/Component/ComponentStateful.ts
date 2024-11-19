import { BehaviorSubject, Observable } from "rxjs"
import { Children } from "./Children"

export interface ComponentStateful<TProps = any, TState = any> {
  parentId: string
  parentAttr: string
  parentAttrId: string
  props: () => TProps
  stateSubject: BehaviorSubject<TState>
  state: Observable<TState>
  children(state: BehaviorSubject<TState>): Children[]
  setProps(cb: () => TProps): this
  mount(): void
  destroy(): void
  onMounted(): void
  onUpdated(): void
  onDestroy(): void
  render(): string
}
