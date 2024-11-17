import "reflect-metadata"

import { containerApp } from "./app/compositionRoot/container"
import { RootCreator } from "./core/framework/RenderRoot"
import { GameBox } from "./feature/GameBox"

const rootCreator = containerApp.get<RootCreator>(RootCreator)
const root = document.getElementById("root")

if (root) {
  rootCreator.render(root, () => containerApp.get<GameBox>(GameBox))
} else {
  throw Error("Not found root element")
}
