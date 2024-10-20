import { Container } from "inversify"
import { ErrorService } from "../../domain/Error"
import { GameMathSprint, GameRemote } from "../../domain/Game"
import type {
  ErrorConfig,
  ErrorHandler,
  Game,
  GameConfig,
  Remote,
} from "../../interfaces"
import { ErrorConfiguration, GameConfiguration } from "../configuration"
import { TYPES } from "./types"

const container = new Container({
  autoBindInjectable: true,
  skipBaseClassChecks: true,
})

container
  .bind<ErrorConfig>(TYPES.ErrorConfig)
  .to(ErrorConfiguration)
  .inSingletonScope()

container
  .bind<GameConfig>(TYPES.GameConfig)
  .to(GameConfiguration)
  .inSingletonScope()

container.bind<ErrorHandler>(TYPES.ErrorHandler).to(ErrorService)

container.bind<Game>(TYPES.Game).to(GameMathSprint).inSingletonScope()

container.bind<Remote>(TYPES.Remote).to(GameRemote).inSingletonScope()

export { container }
