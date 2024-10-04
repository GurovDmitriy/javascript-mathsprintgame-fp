import { BehaviorSubject, Observable, Subject } from "rxjs"

export interface Component<TProps = any> {
  setProps(props: TProps): void
  render(): string
}

export interface ComponentStateful<TProps = any, TState = any>
  extends Component<TProps> {
  idParent: string
  idParentAttr: string
  stateSubject: BehaviorSubject<TState>
  stateInit: TState
  state: Observable<TState>
  unsubscribe: Subject<void>
  create(): void
  destroy(): void
  onInit?(): void
  onMounted?(): void
  onUpdated?(): void
}

export interface ComponentStateless<TProps> extends Component<TProps> {}
