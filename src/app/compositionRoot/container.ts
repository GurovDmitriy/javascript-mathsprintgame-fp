import { Container, interfaces } from "inversify"
import { container } from "../../core/compositionRoot/container"
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
const containerApp = new Container({
  autoBindInjectable: true,
  skipBaseClassChecks: true,
})

containerApp.parent = container

// Base
containerApp.bind<ErrorBase>(TYPES.ErrorHeavy).to(ErrorHeavy)
containerApp.bind<ErrorBase>(TYPES.ErrorLight).to(ErrorLight)
containerApp.bind<ErrorInfo>(TYPES.ErrorReadable).to(ErrorReadable)

// Factory
containerApp
  .bind<interfaces.Factory<ErrorBase>>(TYPES.ErrorLightFactory)
  .toFactory<ErrorBase, [ErrorMessage, ErrorCode, ErrorStatus]>(() => {
    return (message, code, status) => new ErrorLight(message, code, status)
  })

containerApp
  .bind<interfaces.Factory<ErrorBase>>(TYPES.ErrorHeavyFactory)
  .toFactory<ErrorBase, [ErrorMessage, ErrorCode, ErrorStatus]>(() => {
    return (message, code, status) => new ErrorHeavy(message, code, status)
  })

containerApp
  .bind<interfaces.Factory<ErrorInfo>>(TYPES.ErrorReadableFactory)
  .toFactory<ErrorInfo, [ErrorMessage, ErrorCode, ErrorStatus]>(() => {
    return (message, code, status) => new ErrorReadable(message, code, status)
  })

// configuration
containerApp
  .bind<ErrorConfig>(TYPES.ErrorConfig)
  .to(ErrorConfiguration)
  .inSingletonScope()

containerApp
  .bind<GameConfig>(TYPES.GameConfig)
  .to(GameConfiguration)
  .inSingletonScope()

// error handler
containerApp
  .bind<ErrorGlobalHandler>(TYPES.ErrorGlobalHandler)
  .to(ErrorInformer)
  .inSingletonScope()

containerApp
  .bind<ErrorHandler>(TYPES.ErrorHandler)
  .to(ErrorService)
  .inSingletonScope()

// game
containerApp.bind<Game>(TYPES.Game).to(GameMathSprint).inSingletonScope()
containerApp.bind<Remote>(TYPES.Remote).to(GameRemote).inSingletonScope()

export { containerApp }
