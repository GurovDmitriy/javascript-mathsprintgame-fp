import { Container } from "inversify"
import { Blinder } from "../framework/Blinder"
import { ComponentBase, ComponentPure } from "../framework/Component"
import { RootCreator } from "../framework/RenderRoot"
import type {
  ComponentStateful,
  ComponentStateless,
  RootRender,
  Sweeper,
} from "../interface"
import { TYPES } from "./types"

const container = new Container({
  autoBindInjectable: true,
  skipBaseClassChecks: true,
})

container.bind<RootRender>(TYPES.RenderRoot).to(RootCreator)
container.bind<ComponentStateless>(TYPES.ComponentStateless).to(ComponentPure)
container.bind<ComponentStateful>(TYPES.ComponentStateful).to(ComponentBase)
container.bind<Sweeper>(TYPES.Sweeper).to(Blinder).inSingletonScope()

export { container }
