import { Container, interfaces } from "inversify"
import { container } from "../../core/compositionRoot/container.ts"
import { TYPES as TYPES_BRAINFUL } from "../../core/compositionRoot/types.ts"
import { IdGenerator } from "../../core/interface/index.ts"
import { ErrorInformer } from "../../domain/Error/ErrorInformer.ts"
import {
  ErrorHeavy,
  ErrorLight,
  ErrorReadable,
  ErrorService,
} from "../../domain/Error/index.js"
import { GameMathSprint, GameRemote } from "../../domain/Game/index.js"
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
} from "../../interfaces/index.js"
import {
  ErrorConfiguration,
  GameConfiguration,
} from "../configuration/index.js"
import { ComponentId } from "../internal/ComponentId.js"
import { TYPES } from "./types.js"

const containerApp = new Container({
  autoBindInjectable: true,
  skipBaseClassChecks: true,
})

containerApp.parent = container

container.unbind(TYPES_BRAINFUL.ComponentId)
container.bind<IdGenerator>(TYPES_BRAINFUL.ComponentId).to(ComponentId)

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
