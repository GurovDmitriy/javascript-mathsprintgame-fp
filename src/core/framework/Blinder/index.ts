import { injectable } from "inversify"
import { BehaviorSubject, Observable } from "rxjs"
import { container } from "../../compositionRoot/container"
import type { Sweeper } from "../../interface"

@injectable()
export class Blinder implements Sweeper {
  stateSubject: BehaviorSubject<any>
  state: Observable<any>

  constructor() {
    this.stateSubject = new BehaviorSubject({})
    this.state = this.stateSubject.asObservable()
  }

  sweep(cons: any): void {
    if (cons && cons.constructor) {
      if (container.isBound(cons.constructor)) {
        cons.destroy()
        container.unbind(cons.constructor)
      }
    }
  }

  update(): void {
    this.stateSubject.next({})
  }
}
