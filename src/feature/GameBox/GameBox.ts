import { compile } from "handlebars"
import { fromJS, FromJS } from "immutable"
import { inject, injectable } from "inversify"
import * as R from "ramda"
import {
  BehaviorSubject,
  filter,
  Observable,
  Subject,
  takeUntil,
  tap,
} from "rxjs"
import { TYPES } from "../../app/compositionRoot/types"
import { TYPES as T } from "../../core/compositionRoot/types"
import { ComponentBase } from "../../core/framework/Component"
import { Children, type Sweeper } from "../../core/interface"
import type { Game } from "../../interfaces"
import { GameBoxStateCountdown } from "./GameBoxStateCountdown"
import { GameBoxStateError } from "./GameBoxStateError"
import { GameBoxStateQuiz } from "./GameBoxStateQuiz"
import { GameBoxStateScore } from "./GameBoxStateScore"
import { GameBoxStateStart } from "./GameBoxStateStart"
import { ComponentNames, GameBoxContext } from "./types"

interface State {
  active: ComponentNames
  start: boolean
  countdown: boolean
  quiz: boolean
  score: boolean
  error: boolean
}

type StateImm = FromJS<State>

@injectable()
export class GameBox extends ComponentBase<any, StateImm, ComponentNames> {
  public unsubscribe: Subject<void>
  public stateSubject: BehaviorSubject<StateImm>
  public state: Observable<StateImm>
  public children: Children<ComponentNames>

  constructor(
    @inject(T.Sweeper) blinder: Sweeper,
    @inject(TYPES.Game) private readonly _game: Game,
    public stateStart: GameBoxStateStart,
    public stateCountdown: GameBoxStateCountdown,
    public stateQuiz: GameBoxStateQuiz,
    public stateScore: GameBoxStateScore,
    public stateError: GameBoxStateError,
  ) {
    super(blinder)

    this.unsubscribe = new Subject<void>()

    this.children = {
      start: {
        value: "start",
        component: this.stateStart,
      },
      countdown: {
        value: "countdown",
        component: this.stateCountdown,
      },
      quiz: {
        value: "quiz",
        component: this.stateQuiz,
      },
      score: {
        value: "score",
        component: this.stateScore,
      },
      error: {
        value: "error",
        component: this.stateError,
      },
    }

    this.stateSubject = new BehaviorSubject<StateImm>(
      fromJS({
        active: "start",
        start: true,
        countdown: false,
        quiz: false,
        score: false,
        error: false,
      } satisfies State),
    )

    this.state = this.stateSubject.asObservable()
  }

  onInit() {
    this._handlerError()
    this._handlerSetPropsChildren()
  }

  onUpdated() {
    this._handlerRecreateChildren()
  }

  setState(name: ComponentNames) {
    this.stateSubject.next(
      this.stateSubject.getValue().merge(
        fromJS({
          active: name,
          start: name === "start",
          countdown: name === "countdown",
          quiz: name === "quiz",
          score: name === "score",
          error: name === "error",
        }),
      ),
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

  private _handlerSetPropsChildren() {
    const context: GameBoxContext = {
      setState: this.setState.bind(this),
    }

    R.forEach((c) => c.component.setProps(context), R.values(this.children))
  }

  private _handlerRecreateChildren() {
    const active = this.stateSubject.getValue().get("active") as ComponentNames

    R.ifElse(
      (value: typeof active) => R.isNotNil(value),
      (value) => {
        this.children[value].component.create()

        R.pipe(
          (children: typeof this.children) => R.toPairs(children),
          (pairs) =>
            R.filter(
              ([name]) =>
                R.complement(R.equals(active))(name as ComponentNames),
              pairs,
            ),
          R.forEach(([, value]) => value.component.destroy()),
        )(this.children)
      },
      () => {},
    )(active)
  }

  render() {
    const template = compile(`
      <div class="header-game-box">
        {{#if state.start}}
        <div class="header-game-box__inner" {{{idParentAttrStateStart}}}>
        </div>
        {{/if}}
        {{#if state.countdown}}
        <div class="header-game-box__inner" {{{idParentAttrStateCountdown}}}>
        </div>
        {{/if}}
        {{#if state.quiz}}
        <div class="header-game-box__inner" {{{idParentAttrStateQuiz}}}>
        </div>
        {{/if}}
        {{#if state.score}}
        <div class="header-game-box__inner" {{{idParentAttrStateScore}}}>
        </div>
        {{/if}}
        {{#if state.error}}
        <div class="header-game-box__inner" {{{idParentAttrStateError}}}>
        </div>
        {{/if}}
      </div>
    `)

    return template({
      idParentAttrStateStart: this.stateStart.idParentAttr,
      idParentAttrStateCountdown: this.stateCountdown.idParentAttr,
      idParentAttrStateQuiz: this.stateQuiz.idParentAttr,
      idParentAttrStateScore: this.stateScore.idParentAttr,
      idParentAttrStateError: this.stateError.idParentAttr,
      state: this.stateSubject.getValue().toJS(),
    })
  }
}
