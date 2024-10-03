import { compile } from "handlebars"
import { injectable } from "inversify"
import { ComponentBase } from "../../core/framework/ComponentBase"
import { ComponentStateful } from "../../core/interface/Component"
import { GameBoxStateCountdown } from "./GameBoxStateCountdown"
import { GameBoxStateStart } from "./GameBoxStateStart"

interface State {
  stateActive: ComponentStateful
  timer: number
  visibleStateStart: boolean
  visibleStateCountdown: boolean
  visibleStateQuiz: boolean
}

@injectable()
export class GameBox extends ComponentBase<any, State> {
  constructor(
    private stateStart: GameBoxStateStart,
    private stateCountdown: GameBoxStateCountdown,
  ) {
    super({
      stateActive: stateStart,
      timer: 3,
      visibleStateStart: true,
      visibleStateCountdown: false,
      visibleStateQuiz: false,
    })
  }

  setStateSplash() {
    this.stateSubject.next({
      ...this.stateSubject.getValue(),
      stateActive: this.stateStart,
      visibleStateStart: true,
      visibleStateCountdown: false,
      visibleStateQuiz: false,
    })
  }

  setStateCountdown() {
    this.stateSubject.next({
      ...this.stateSubject.getValue(),
      stateActive: this.stateCountdown,
      visibleStateStart: false,
      visibleStateCountdown: true,
      visibleStateQuiz: false,
    })

    this.stateStart.destroy()
  }

  setQuizState() {
    this.stateSubject.next({
      ...this.stateSubject.getValue(),
      stateActive: this.stateStart,
      visibleStateStart: false,
      visibleStateCountdown: false,
      visibleStateQuiz: true,
    })

    this.stateCountdown.destroy()
  }

  updated() {
    this.stateSubject.getValue().stateActive.create()
  }

  render() {
    const context = {
      timer: this.stateSubject.getValue().timer,
      setStateSplash: this.setStateSplash.bind(this),
      setStateCountdown: this.setStateCountdown.bind(this),
    }

    this.stateStart.setProps(context)
    this.stateCountdown.setProps(context)

    const template = compile(`
      <div class="header-game-box">
        {{#if state.visibleStateStart}}
        <div class="header-game-box__inner" {{{idParentAttrStateStart}}}>
          {{{componentActive}}}
        </div>
        {{/if}}
        {{#if state.visibleStateCountdown}}
        <div class="header-game-box__inner" {{{idParentAttrStateCountdown}}}>
          {{{componentActive}}}
        </div>
        {{/if}}
      </div>
    `)

    return template({
      idParentAttrStateStart: this.stateStart.idParentAttr,
      idParentAttrStateCountdown: this.stateCountdown.idParentAttr,
      state: this.stateSubject.getValue(),
      componentActive: this.stateSubject.getValue().stateActive.render(),
    })
  }
}
