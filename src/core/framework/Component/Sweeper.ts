import { injectable } from "inversify"
import { Observable, Subject } from "rxjs"

@injectable()
export class Sweeper {
  stateSubject: Subject<any>
  state: Observable<any>

  constructor() {
    this.stateSubject = new Subject()
    this.state = this.stateSubject.asObservable()
  }

  sweep(): void {
    console.log("1")
    this.stateSubject.next({})
  }
}
