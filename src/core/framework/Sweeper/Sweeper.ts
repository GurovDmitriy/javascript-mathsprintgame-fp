import { injectable } from "inversify"
import { Observable, Subject } from "rxjs"
import type { Cleaner } from "../../interface/index.js"

@injectable()
export class Sweeper implements Cleaner {
  #stateSubject: Subject<any>
  state: Observable<any>

  constructor() {
    this.#stateSubject = new Subject()
    this.state = this.#stateSubject.asObservable()
  }

  clean(): void {
    this.#stateSubject.next({})
  }
}
