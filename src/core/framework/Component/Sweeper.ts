import { injectable } from "inversify"
import { Observable, Subject } from "rxjs"

// TODO: add config skipping update count strategy
@injectable()
export class Sweeper {
  stateSubject: Subject<any>
  state: Observable<any>

  constructor() {
    this.stateSubject = new Subject()
    this.state = this.stateSubject.asObservable()
  }

  sweep(): void {
    this.stateSubject.next({})
  }
}
