import { Container } from "inversify"
import { ErrorService } from "../../domain/Error"
import type { ErrorHandler, RootElement } from "../../interfaces"
import { RootViewElement } from "../GameConfig"
import { TYPES } from "./types"

const container = new Container({
  defaultScope: "Singleton",
  autoBindInjectable: true,
})

container.bind<ErrorHandler>(TYPES.ErrorHandler).to(ErrorService)
container.bind<RootElement>(TYPES.RootElement).to(RootViewElement)

export { container }
