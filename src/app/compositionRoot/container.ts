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
const c = new Container({
  autoBindInjectable: true,
  skipBaseClassChecks: true,
})

// Base
c.bind<ErrorBase>(TYPES.ErrorHeavy).to(ErrorHeavy)
c.bind<ErrorBase>(TYPES.ErrorLight).to(ErrorLight)
c.bind<ErrorInfo>(TYPES.ErrorReadable).to(ErrorReadable)

// Factory
c.bind<interfaces.Factory<ErrorBase>>(TYPES.ErrorLightFactory).toFactory<
  ErrorBase,
  [ErrorMessage, ErrorCode, ErrorStatus]
>(() => {
  return (message, code, status) => new ErrorLight(message, code, status)
})

c.bind<interfaces.Factory<ErrorBase>>(TYPES.ErrorHeavyFactory).toFactory<
  ErrorBase,
  [ErrorMessage, ErrorCode, ErrorStatus]
>(() => {
  return (message, code, status) => new ErrorHeavy(message, code, status)
})

c.bind<interfaces.Factory<ErrorInfo>>(TYPES.ErrorReadableFactory).toFactory<
  ErrorInfo,
  [ErrorMessage, ErrorCode, ErrorStatus]
>(() => {
  return (message, code, status) => new ErrorReadable(message, code, status)
})

// configuration
c.bind<ErrorConfig>(TYPES.ErrorConfig).to(ErrorConfiguration).inSingletonScope()

c.bind<GameConfig>(TYPES.GameConfig).to(GameConfiguration).inSingletonScope()

// error handler
c.bind<ErrorGlobalHandler>(TYPES.ErrorGlobalHandler)
  .to(ErrorInformer)
  .inSingletonScope()

c.bind<ErrorHandler>(TYPES.ErrorHandler).to(ErrorService).inSingletonScope()

// game
c.bind<Game>(TYPES.Game).to(GameMathSprint).inSingletonScope()
c.bind<Remote>(TYPES.Remote).to(GameRemote).inSingletonScope()

containerFramework.parent = c

export { containerFramework as container }
