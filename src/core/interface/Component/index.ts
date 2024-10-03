import { Observable } from "rxjs"

export interface Component<TProps = any> {
  setProps(props: TProps): void
  render(): string
}

export interface ComponentStateful<TProps = any, TState = any>
  extends Component<TProps> {
  idParent: string
  idParentAttr: string
  state: Observable<TState>
  create(): void
  init(): void
  mounted(): void
  updated(): void
  destroy(): void
}

export interface ComponentStateless<TProps> extends Component<TProps> {}
