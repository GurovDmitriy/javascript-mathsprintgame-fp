import { Container, interfaces } from "inversify"
import {
  ErrorHeavy,
  ErrorLight,
  ErrorReadable,
  ErrorService,
} from "../../domain/Error"
import { GameMathSprint, GameRemote } from "../../domain/Game"
import type {
  ErrorBase,
  ErrorCodeCustom,
  ErrorConfig,
  ErrorHandler,
  ErrorInfo,
  ErrorMessage,
  Game,
  GameConfig,
  Remote,
} from "../../interfaces"
import { ErrorConfiguration, GameConfiguration } from "../configuration"
import { TYPES } from "./types"

// Settings IoC
const container = new Container({
  autoBindInjectable: true,
  skipBaseClassChecks: true,
})

// Base
container.bind<ErrorBase>(TYPES.ErrorHeavy).to(ErrorHeavy)
container.bind<ErrorBase>(TYPES.ErrorLight).to(ErrorLight)
container.bind<ErrorInfo>(TYPES.ErrorReadable).to(ErrorReadable)

// Factory
container
  .bind<interfaces.Factory<ErrorBase>>(TYPES.ErrorLightFactory)
  .toFactory<
    ErrorBase,
    [ErrorMessage | undefined, ErrorCodeCustom | undefined]
  >(() => {
    return (message, code) => new ErrorLight(message, code)
  })

container
  .bind<interfaces.Factory<ErrorBase>>(TYPES.ErrorHeavyFactory)
  .toFactory<
    ErrorBase,
    [ErrorMessage | undefined, ErrorCodeCustom | undefined]
  >(() => {
    return (message, code) => new ErrorHeavy(message, code)
  })

container
  .bind<interfaces.Factory<ErrorInfo>>(TYPES.ErrorReadableFactory)
  .toFactory<
    ErrorInfo,
    [ErrorMessage | undefined, ErrorCodeCustom | undefined]
  >(() => {
    return (message, code) => new ErrorReadable(message, code)
  })

// configuration
container
  .bind<ErrorConfig>(TYPES.ErrorConfig)
  .to(ErrorConfiguration)
  .inSingletonScope()

container
  .bind<GameConfig>(TYPES.GameConfig)
  .to(GameConfiguration)
  .inSingletonScope()

// error handler
container
  .bind<ErrorHandler>(TYPES.ErrorHandler)
  .to(ErrorService)
  .inSingletonScope()

// game
container.bind<Game>(TYPES.Game).to(GameMathSprint).inSingletonScope()
container.bind<Remote>(TYPES.Remote).to(GameRemote).inSingletonScope()

export { container }
