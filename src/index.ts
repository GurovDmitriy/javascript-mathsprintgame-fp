import "reflect-metadata"

import { container } from "./app/compositionRoot/container"
import { RootCreator } from "./core/framework/RenderRoot"
import { GameBox } from "./feature/GameBox"

const rootCreator = container.get<RootCreator>(RootCreator)

const root = document.getElementById("root")

if (root) {
  rootCreator.render(root, () => container.get<GameBox>(GameBox))
} else {
  throw Error("Not found root element")
}
