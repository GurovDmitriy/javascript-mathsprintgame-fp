import { fromJS, FromJS } from "immutable"
import { inject, injectable } from "inversify"
import M from "mustache"
import * as R from "ramda"
import {
  BehaviorSubject,
  filter,
  Observable,
  Subject,
  takeUntil,
  tap,
} from "rxjs"
import { containerApp } from "../../app/compositionRoot/container.ts"
import { TYPES } from "../../app/compositionRoot/types.ts"
import { ComponentBase } from "../../core/framework/Component/index.ts"
import { Children, ComponentStateful } from "../../core/interface/index.ts"
import type { Game } from "../../interfaces/index.ts"
import { childrenIterator } from "../../shared/tools/childrenIterator.ts"
import { GameBoxStateCountdown } from "./GameBoxStateCountdown.ts"
import { GameBoxStateError } from "./GameBoxStateError.ts"
import { GameBoxStateQuiz } from "./GameBoxStateQuiz.ts"
import { GameBoxStateScore } from "./GameBoxStateScore.ts"
import { GameBoxStateStart } from "./GameBoxStateStart.ts"
import { Step } from "./types.ts"

interface State {
  children: {
    active: {
      component: ComponentStateful
    }
  }
}

type StateImm = FromJS<State>

@injectable()
export class GameBox extends ComponentBase<any, StateImm> {
  public unsubscribe: Subject<void>
  public stateSubject: BehaviorSubject<StateImm>
  public state: Observable<StateImm>
  public childrenMap: { [K in Step]: () => { component: ComponentStateful } }

  constructor(@inject(TYPES.Game) private readonly _game: Game) {
    super()

    this.unsubscribe = new Subject<void>()

    this.childrenMap = {
      start: () => ({
        component: containerApp
          .get(GameBoxStateStart)
          .setProps(() => ({ setState: this.setState.bind(this) })),
      }),

      countdown: () => ({
        component: containerApp
          .get(GameBoxStateCountdown)
          .setProps(() => ({ setState: this.setState.bind(this) })),
      }),

      quiz: () => ({
        component: containerApp
          .get(GameBoxStateQuiz)
          .setProps(() => ({ setState: this.setState.bind(this) })),
      }),
      score: () => ({
        component: containerApp
          .get(GameBoxStateScore)
          .setProps(() => ({ setState: this.setState.bind(this) })),
      }),
      error: () => ({
        component: containerApp
          .get(GameBoxStateError)
          .setProps(() => ({ setState: this.setState.bind(this) })),
      }),
    }

    this.stateSubject = new BehaviorSubject<StateImm>(
      fromJS({
        children: {
          active: this.childrenMap.start(),
        },
      } satisfies State),
    )

    this.state = this.stateSubject.asObservable()
    this._handlerError()
  }

  onDestroy() {
    this.unsubscribe.next()
    this.unsubscribe.complete()
    this.stateSubject.complete()
  }

  children(): { forEach: (cb: (c: Children) => void) => void } {
    return childrenIterator(this.stateSubject)
  }

  setState(name: Step) {
    this.stateSubject.next(
      this.stateSubject
        .getValue()
        .setIn(["children", "active"], fromJS(this.childrenMap[name]())),
    )
  }

  private _handlerError() {
    this._game.error
      .pipe(
        takeUntil(this.unsubscribe),
        filter((error) => error !== null),
        tap((error) => {
          R.ifElse(
            (err) => err !== null,
            () => this.setState("error"),
            () => {},
          )(error)
        }),
      )
      .subscribe()
  }

  render() {
    const template = `
      <div class="header-game-box">
        <div class="header-game-box__inner" data-b-key="{{active.id}}"></div>
      </div>
    `

    return M.render(template, {
      active: this.stateSubject
        .getValue()
        .getIn(["children", "active", "component"]),
    })
  }
}
