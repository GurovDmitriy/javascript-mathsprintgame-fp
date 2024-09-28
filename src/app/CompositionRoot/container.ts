import { Container } from "inversify"
import { ErrorService } from "../../domain/Error"
import { Game } from "../../domain/Game"
import { SelectQuestion } from "../../feature/SelectQuestion/SelectQuestion"
import { StartGame } from "../../feature/StartGame/StartGame"
import type { ErrorHandler, RootElement } from "../../interfaces"
import { GameConfiguration, RootViewElement } from "../GameConfig"
import { TYPES } from "./types"

const container = new Container()

// interfaces
container
  .bind<ErrorHandler>(TYPES.ErrorHandler)
  .to(ErrorService)
  .inSingletonScope()
container
  .bind<RootElement>(TYPES.RootElement)
  .to(RootViewElement)
  .inSingletonScope()

// self
container.bind<GameConfiguration>(GameConfiguration).toSelf().inSingletonScope()
container.bind<Game>(Game).toSelf().inSingletonScope()
container.bind<SelectQuestion>(SelectQuestion).toSelf().inSingletonScope()
container.bind<StartGame>(StartGame).toSelf().inSingletonScope()

export { container }
