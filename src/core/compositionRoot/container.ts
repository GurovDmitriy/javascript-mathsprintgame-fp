import { Container } from "inversify"
import { Sweeper } from "../framework/Component/Sweeper"
import { RootCreator } from "../framework/RenderRoot"
import type { RootRender } from "../interface"
import { TYPES } from "./types"

const container = new Container({
  autoBindInjectable: true,
  skipBaseClassChecks: true,
})

container.bind<RootRender>(TYPES.RenderRoot).to(RootCreator)
container.bind<Sweeper>(TYPES.Sweeper).to(Sweeper).inSingletonScope()

export { container }
