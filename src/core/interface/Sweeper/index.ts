import { Observable } from "rxjs"

export interface Sweeper {
  state: Observable<any>
  update(): void
  sweep(cons: any): void
}
