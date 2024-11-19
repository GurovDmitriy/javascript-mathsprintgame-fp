import { compile } from "handlebars"
import { fromJS, List, Map } from "immutable"
import { inject, injectable } from "inversify"
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
import { containerApp } from "../../app/compositionRoot/container"
import { TYPES } from "../../app/compositionRoot/types"
import { ComponentBase } from "../../core/framework/Component"
import type { Game } from "../../interfaces"
import { Button } from "../../shared/components/Button"
import { ButtonHeavy } from "../../shared/components/ButtonHeavy"
import { delegate } from "../../shared/tools/delegate"
import { ComponentNames } from "./types"

@injectable()
export class GameBox extends ComponentBase<any, any> {
  public unsubscribe: Subject<void>
  public stateSubject: BehaviorSubject<any>
  public state: Observable<any>

  constructor(@inject(TYPES.Game) private readonly _game: Game) {
    super()

    this.unsubscribe = new Subject<void>()
    this.stateSubject = new BehaviorSubject<any>(
      fromJS({
        add: {
          component: containerApp
            .get(Button)
            .setProps(() => ({ content: "add", classes: "btn-add" })),
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
    this._handlerError()
  }

  children(state: BehaviorSubject<any>) {
    const newChildren = []
    const traversal = (element) => {
      if (Map.isMap(element)) {
        newChildren.push(element.get("component"))
      }

      if (List.isList(element)) {
        element.forEach((e) => traversal(e))
      }
    }

    state.getValue().forEach((e) => traversal(e))
    return newChildren
  }

  onDestroy() {
    this.unsubscribe.next()
    this.unsubscribe.complete()
  }

  setState(name: ComponentNames) {
    console.log(name)
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

  private _handleAdd() {
    fromEvent(document, "click")
      .pipe(
        takeUntil(this.unsubscribe),
        delegate("btn-add"),
        tap(() =>
          this.stateSubject.next(
            this.stateSubject.getValue().setIn(
              ["list"],
              this.stateSubject
                .getValue()
                .get("list")
                .push(
                  fromJS({
                    component: containerApp
                      .get(ButtonHeavy)
                      .setProps(() => ({ content: "New button" })),
                  }),
                ),
            ),
          ),
        ),
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
    const template = compile(`
      <div class="header-game-box">
        <div class="header-game-box__inner" {{{children.add.component.parentAttrId}}}></div>
        <div class="header-game-box__inner" {{{children.remove.component.parentAttrId}}}></div>
        <div>
          {{#each children.list}}
            <div class="header-game-box__inner" {{{this.component.parentAttrId}}}></div>
          {{/each}}
        </div>
      </div>
    `)

    return template({
      children: this.stateSubject.getValue().toJS(),
    })
  }
}
