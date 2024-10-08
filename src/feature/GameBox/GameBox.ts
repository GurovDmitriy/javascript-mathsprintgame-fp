import { compile } from "handlebars"
import { fromJS, FromJS } from "immutable"
import { injectable } from "inversify"
import { BehaviorSubject, Subject } from "rxjs"
import { ComponentBase } from "../../core/framework/Component"
import { Children } from "../../core/interface/Component"
import { GameBoxStateCountdown } from "./GameBoxStateCountdown"
import { GameBoxStateQuiz } from "./GameBoxStateQuiz"
import { GameBoxStateStart } from "./GameBoxStateStart"
import { ComponentNames, GameBoxContext } from "./types"

interface State {
  active: ComponentNames
  start: boolean
  countdown: boolean
  quiz: boolean
}

type StateImm = FromJS<State>

@injectable()
export class GameBox extends ComponentBase<any, StateImm, ComponentNames> {
  public unsubscribe = new Subject<void>()
  public stateSubject
  public state
  public children: Children<ComponentNames>

  constructor(
    private stateStart: GameBoxStateStart,
    private stateCountdown: GameBoxStateCountdown,
    private stateQuiz: GameBoxStateQuiz,
  ) {
    super()

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
    }

    this.stateSubject = new BehaviorSubject<StateImm>(
      fromJS({
        active: "start",
        start: true,
        countdown: false,
        quiz: false,
      } satisfies State),
    )

    this.state = this.stateSubject.asObservable()
  }

  onInit() {
    const context: GameBoxContext = {
      setState: this.setState.bind(this),
    }

    Object.values(this.children).forEach((c) => c.component.setProps(context))
  }

  onUpdated() {
    const active = this.stateSubject.getValue().get("active") as
      | ComponentNames
      | undefined

    if (active) {
      this.children[active].component.create()

      for (const [name, value] of Object.entries(this.children)) {
        if (name !== active) {
          value.component.destroy()
        }
      }
    }
  }

  setState(name: ComponentNames) {
    this.stateSubject.next(
      this.stateSubject.getValue().merge(
        fromJS({
          active: name,
          start: name === "start",
          countdown: name === "countdown",
          quiz: name === "quiz",
        }),
      ),
    )
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
      </div>
    `)

    return template({
      idParentAttrStateStart: this.stateStart.idParentAttr,
      idParentAttrStateCountdown: this.stateCountdown.idParentAttr,
      idParentAttrStateQuiz: this.stateQuiz.idParentAttr,
      state: this.stateSubject.getValue().toJS(),
    })
  }
}
