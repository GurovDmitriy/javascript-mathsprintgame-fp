import { Container } from "inversify"
import { ComponentId, ElementFinder } from "../framework/Component/index.ts"
import { RootCreator } from "../framework/RootCreator/index.ts"
import type { DomFinder, IdGenerator, RootRender } from "../interface/index.ts"
import { TYPES } from "./types.ts"

const container = new Container({
  autoBindInjectable: true,
  skipBaseClassChecks: true,
})

container.bind<RootRender>(TYPES.RootCreator).to(RootCreator)
container.bind<IdGenerator>(TYPES.ComponentId).to(ComponentId)
container.bind<DomFinder>(TYPES.ElementFinder).to(ElementFinder)

export { container }
