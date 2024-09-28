import { Observable } from "rxjs"

export interface Component {
  init(): void | Observable<any>
  destroy(): void | Observable<any>
  handle(): void | Observable<any>
  render(): void | Observable<any>
}
