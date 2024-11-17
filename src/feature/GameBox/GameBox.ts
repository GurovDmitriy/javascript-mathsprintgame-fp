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
import { TYPES as T } from "../../core/compositionRoot/types"
import { ComponentBase, Sweeper } from "../../core/framework/Component"
import type { Game } from "../../interfaces"
import { Button } from "../../shared/components/Button"
import { ButtonHeavy } from "../../shared/components/ButtonHeavy"
import { delegate } from "../../shared/tools/delegate"
import { ComponentNames } from "./types"

// interface State {
//   active: string
// }

// type StateImm = FromJS<State>

@injectable()
export class GameBox extends ComponentBase<any, any> {
  public unsubscribe: Subject<void>
  public stateSubject: BehaviorSubject<any>
  public state: Observable<any>

  //**************
  // Sweeper Children
  //**************
  // save components only in this weakMap
  // read only idAttr for map and template
  // control keys week
  // mount destroy unbind from container
  // trigger state or children as Observer?
  // meta for create classes with container

  // public childrenMeta = {
  //   start: GameBoxStateStart,
  //   countdown: GameBoxStateCountdown,
  //   quiz: GameBoxStateQuiz,
  //   score: GameBoxStateScore,
  //   error: GameBoxStateError,
  // }

  // public childrenSubject = new BehaviorSubject<any>(
  //   fromJS({
  //     add: {
  //       component: containerApp.get(Button),
  //       props: () => ({ content: "add", classes: "btn-add" }),
  //     },
  //     remove: {
  //       component: containerApp.get(Button),
  //       props: () => ({ content: "remove", classes: "btn-remove" }),
  //     },
  //     list: [
  //       {
  //         component: containerApp.get(Button),
  //         props: () => ({ content: "button 1" }),
  //       },
  //       {
  //         component: containerApp.get(Button),
  //         props: () => ({ content: "button 2" }),
  //       },
  //     ],
  //   }),
  // )
  // public children = this.childrenSubject.asObservable()
  //
  // public childrenMapSubject = new BehaviorSubject<any>({})
  // public childrenMap = this.childrenMapSubject.asObservable()

  constructor(
    @inject(T.Sweeper) private readonly _sweeper: Sweeper,
    @inject(TYPES.Game) private readonly _game: Game,
  ) {
    super()

    this.unsubscribe = new Subject<void>()
    this.stateSubject = new BehaviorSubject<any>(
      fromJS({
        add: {
          component: containerApp.get(Button),
          props: () => ({ content: "add", classes: "btn-add" }),
        },
        remove: {
          component: containerApp.get(Button),
          props: () => ({ content: "remove", classes: "btn-remove" }),
        },
        list: [
          {
            component: containerApp.get(ButtonHeavy),
            props: () => ({ content: "button 1" }),
          },
          {
            component: containerApp.get(ButtonHeavy),
            props: () => ({ content: "button 2" }),
          },
        ],
      }),
    )
    this.state = this.stateSubject.asObservable()
    this._handlerError()
  }

  onMounted() {
    this._handleAdd()
    this._handleRemove()
  }

  onDestroy() {
    this.unsubscribe.next()
    this.unsubscribe.complete()
  }

  onUpdated() {
    this.stateSubject.getValue().forEach((v) => {
      if (Map.isMap(v)) {
        v.get("component").setProps(v.get("props")())
        v.get("component").mount()
      } else if (List.isList(v)) {
        v.forEach((l) => {
          l.get("component").setProps(l.get("props")())
          l.get("component").mount()
        })
      }
    })

    this._sweeper.sweep()
  }

  setState(name: ComponentNames) {
    console.log(name)
    // this.stateSubject.next(this.stateSubject.getValue().set("active", name))
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
                    component: containerApp.get(ButtonHeavy),
                    props: () => ({ content: "New button" }),
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
