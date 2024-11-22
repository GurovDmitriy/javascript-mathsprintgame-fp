import { FromJS, fromJS, List, Map } from "immutable"
import { inject, injectable } from "inversify"
import M from "mustache"
import * as R from "ramda"
import {
  BehaviorSubject,
  filter,
  fromEvent,
  Observable,
  Subject,
  takeUntil,
  tap,
} from "rxjs"
import { containerApp } from "../../app/compositionRoot/container.js"
import { TYPES } from "../../app/compositionRoot/types.js"
import { ComponentBase } from "../../core/framework/Component/index.js"
import { Children } from "../../core/interface/index.js"
import type { Game } from "../../interfaces/index.js"
import { Button } from "../../shared/components/Button/index.js"
import { ButtonHeavy } from "../../shared/components/ButtonHeavy/index.js"
import { delegate } from "../../shared/tools/delegate.js"
import { ComponentNames } from "./types.js"

interface ElementBtn {
  component: Children
}

interface State {
  add: ElementBtn
  remove: ElementBtn
  list: [ElementBtn]
}

type StateImm = FromJS<State>

@injectable()
export class GameBox extends ComponentBase<any, StateImm> {
  public unsubscribe: Subject<void>
  public stateSubject: BehaviorSubject<any>
  public state: Observable<any>

  constructor(@inject(TYPES.Game) private readonly _game: Game) {
    super()

    this.unsubscribe = new Subject<void>()
    this.stateSubject = new BehaviorSubject<any>(
      fromJS({
        add: {
          component: containerApp.get(Button).setProps(() => ({
            content: "add",
            classes: "btn-add",
          })),
        },
        remove: {
          component: containerApp
            .get(Button)
            .setProps(() => ({ content: "remove", classes: "btn-remove" })),
        },
        list: [
          {
            component: containerApp
              .get(ButtonHeavy)
              .setProps(() => ({ content: "abc", classes: "btn" })),
          },
          {
            component: containerApp
              .get(ButtonHeavy)
              .setProps(() => ({ content: "abc", classes: "btn" })),
          },
        ],
      }),
    )
    this.state = this.stateSubject.asObservable()

    this._handleAdd()
    this._handleRemove()
    this._handleError()
  }

  children(): { forEach(cb: (c: Children) => void): void } {
    return {
      forEach: (cb: (c: Children) => void) => {
        const traversal = (c: any) => {
          if (Map.isMap(c)) {
            cb(c.get("component") as Children)
          }

          if (List.isList(c)) {
            c.forEach((c) => traversal(c))
          }
        }

        this.stateSubject.getValue().forEach((c: any) => traversal(c))
      },
    }
  }

  onDestroy() {
    this.unsubscribe.next()
    this.unsubscribe.complete()
  }

  setState(name: ComponentNames) {
    console.log(name)
  }

  private _handleError() {
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

  private _handleAdd() {
    fromEvent(document, "click")
      .pipe(
        takeUntil(this.unsubscribe),
        delegate("btn-add"),
        tap(() => {
          this.stateSubject.next(
            this.stateSubject.getValue().setIn(
              ["list"],
              this.stateSubject
                .getValue()
                .get("list")
                .push(
                  fromJS({
                    component: containerApp.get(ButtonHeavy).setProps(() => ({
                      content: "New button",
                      classes: "btn-game-box",
                    })),
                  }),
                ),
            ),
          )
        }),
      )
      .subscribe()
  }

  private _handleRemove() {
    fromEvent(document, "click")
      .pipe(
        takeUntil(this.unsubscribe),
        delegate("btn-remove"),
        tap(() =>
          this.stateSubject.next(
            this.stateSubject
              .getValue()
              .setIn(["list"], this.stateSubject.getValue().get("list").pop()),
          ),
        ),
      )
      .subscribe()
  }

  render() {
    const template = `
      <div class="header-game-box">
        <div class="header-game-box__inner">
          <div data-b-key="{{children.add.component.id}}"></div>
          <div data-b-key="{{children.remove.component.id}}"></div>
        </div>
        <div>
          {{#children.list}}
            <div data-b-key="{{component.id}}"></div>
          {{/children.list}}
        </div>
      </div>
    `

    return M.render(template, {
      children: this.stateSubject.getValue().toJS(),
    })
  }
}
