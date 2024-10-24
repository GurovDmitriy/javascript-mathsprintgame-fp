import { Container, interfaces } from "inversify"
import { container as containerFramework } from "../../core/compositionRoot/container"
import {
  ErrorHeavy,
  ErrorLight,
  ErrorReadable,
  ErrorService,
} from "../../domain/Error"
import { ErrorInformer } from "../../domain/Error/ErrorInformer"
import { GameMathSprint, GameRemote } from "../../domain/Game"
import type {
  ErrorBase,
  ErrorCode,
  ErrorConfig,
  ErrorGlobalHandler,
  ErrorHandler,
  ErrorInfo,
  ErrorMessage,
  ErrorStatus,
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

container.parent = containerFramework

// Base
container.bind<ErrorBase>(TYPES.ErrorHeavy).to(ErrorHeavy)
container.bind<ErrorBase>(TYPES.ErrorLight).to(ErrorLight)
container.bind<ErrorInfo>(TYPES.ErrorReadable).to(ErrorReadable)

// Factory
container
  .bind<interfaces.Factory<ErrorBase>>(TYPES.ErrorLightFactory)
  .toFactory<ErrorBase, [ErrorMessage, ErrorCode, ErrorStatus]>(() => {
    return (message, code, status) => new ErrorLight(message, code, status)
  })

container
  .bind<interfaces.Factory<ErrorBase>>(TYPES.ErrorHeavyFactory)
  .toFactory<ErrorBase, [ErrorMessage, ErrorCode, ErrorStatus]>(() => {
    return (message, code, status) => new ErrorHeavy(message, code, status)
  })

container
  .bind<interfaces.Factory<ErrorInfo>>(TYPES.ErrorReadableFactory)
  .toFactory<ErrorInfo, [ErrorMessage, ErrorCode, ErrorStatus]>(() => {
    return (message, code, status) => new ErrorReadable(message, code, status)
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
  .bind<ErrorGlobalHandler>(TYPES.ErrorGlobalHandler)
  .to(ErrorInformer)
  .inSingletonScope()

container
  .bind<ErrorHandler>(TYPES.ErrorHandler)
  .to(ErrorService)
  .inSingletonScope()

// game
container.bind<Game>(TYPES.Game).to(GameMathSprint).inSingletonScope()
container.bind<Remote>(TYPES.Remote).to(GameRemote).inSingletonScope()

export { container }
