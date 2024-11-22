import { Observable } from "rxjs"

export interface Cleaner {
  state: Observable<any>
  clean(): void
}
