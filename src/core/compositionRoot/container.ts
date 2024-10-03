import { Container } from "inversify"
import { RootCreator } from "../framework/RenderRoot"
import { RootRender } from "../interface/RootRender"
import { TYPES } from "./types"

const container = new Container({
  autoBindInjectable: true,
  skipBaseClassChecks: true,
})

container.bind<RootRender>(TYPES.ComponentStateful).to(RootCreator)

export { container }
