import { Container } from "inversify"
import { container as containerPainful } from "../../core/compositionRoot/container"
import { ErrorService } from "../../domain/Error"
import { GameMathSprint, GameRemote } from "../../domain/Game"
import type { ErrorHandler, Game, GameConfig, Remote } from "../../interfaces"
import { GameConfiguration } from "../gameConfiguration"
import { TYPES } from "./types"

const container = new Container({
  autoBindInjectable: true,
  skipBaseClassChecks: true,
})

container.parent = containerPainful

container
  .bind<ErrorHandler>(TYPES.ErrorHandler)
  .to(ErrorService)
  .inSingletonScope()

container.bind<Game>(TYPES.Game).to(GameMathSprint).inSingletonScope()
container
  .bind<GameConfig>(TYPES.GameConfig)
  .to(GameConfiguration)
  .inSingletonScope()
container.bind<Remote>(TYPES.Remote).to(GameRemote).inSingletonScope()

export { container }
