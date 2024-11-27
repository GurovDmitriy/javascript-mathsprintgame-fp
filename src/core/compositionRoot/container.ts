import { Container } from "inversify"
import { ComponentId, ElementFinder } from "../framework/Component/index.js"
import { RootCreator } from "../framework/RootCreator/index.js"
import type { DomFinder, IdGenerator, RootRender } from "../interface/index.js"
import { TYPES } from "./types.js"

const container = new Container({
  autoBindInjectable: true,
  skipBaseClassChecks: true,
})

container.bind<RootRender>(TYPES.RootCreator).to(RootCreator)
container.bind<IdGenerator>(TYPES.ComponentId).to(ComponentId)
container.bind<DomFinder>(TYPES.ElementFinder).to(ElementFinder)

export { container }
