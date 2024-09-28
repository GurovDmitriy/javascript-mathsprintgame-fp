import { Container } from "inversify"
import { ErrorService } from "../../domain/Error"
import { Game } from "../../domain/Game"
import { SelectQuestion } from "../../feature/SelectQuestion/SelectQuestion"
import { ErrorHandler, GameConfig, RootElement } from "../../interfaces"
import { GameConfiguration, RootViewElement } from "../GameConfig"
import { TYPES } from "./types"

const container = new Container()

// Domain
container.bind<ErrorHandler>(TYPES.ErrorHandler).to(ErrorService)

// Features
container.bind<RootElement>(TYPES.RootElement).to(RootViewElement)
container.bind<GameConfig>(TYPES.GameConfig).to(GameConfiguration)
container.bind<Game>(TYPES.GameModel).to(Game)
container.bind<SelectQuestion>(TYPES.QuestionValue).to(SelectQuestion)

export { container }
