import { Container } from "inversify"
import { ErrorService } from "../../domain/Error"
import { GameMathSprint, GameRemote } from "../../domain/Game"
import type { ErrorHandler, Game, Remote, RootElement } from "../../interfaces"
import { RootViewElement } from "../GameConfig"
import { TYPES } from "./types"

const container = new Container({
  autoBindInjectable: true,
})

container
  .bind<RootElement>(TYPES.RootElement)
  .to(RootViewElement)
  .inSingletonScope()
container
  .bind<ErrorHandler>(TYPES.ErrorHandler)
  .to(ErrorService)
  .inSingletonScope()
container.bind<Game>(TYPES.Game).to(GameMathSprint).inSingletonScope()
container.bind<Remote>(TYPES.Remote).to(GameRemote).inSingletonScope()

export { container }
