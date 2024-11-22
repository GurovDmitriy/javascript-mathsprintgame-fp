import "reflect-metadata"

import { containerApp } from "./app/compositionRoot/container.js"
import { RootCreator } from "./core/framework/RootCreator/index.js"
import { GameBox } from "./feature/GameBox/index.js"

const rootCreator = containerApp.get<RootCreator>(RootCreator)
const root = document.getElementById("root")

if (root) {
  rootCreator.render(root, () => containerApp.get<GameBox>(GameBox))
} else {
  throw Error("Not found root element")
}
