import { Container } from "inversify"
import { ComponentId, ElementFinder, Sweeper } from "../framework/Component"
import { RootCreator } from "../framework/RootCreator"
import type { Cleaner, DomFinder, IdGenerator, RootRender } from "../interface"
import { TYPES } from "./types"

const container = new Container({
  autoBindInjectable: true,
  skipBaseClassChecks: true,
})

container.bind<RootRender>(TYPES.RootCreator).to(RootCreator)
container
  .bind<IdGenerator>(TYPES.ComponentId)
  .to(ComponentId)
  .inSingletonScope()
container
  .bind<DomFinder>(TYPES.ElementFinder)
  .to(ElementFinder)
  .inSingletonScope()
container.bind<Cleaner>(TYPES.Sweeper).to(Sweeper).inSingletonScope()

export { container }
