import "reflect-metadata"

import { RootRender, TYPES } from "@brainfuljs/brainful"
import { containerApp } from "./app/compositionRoot/container.ts"
import { GameBox } from "./feature/GameBox"

const rootCreator = containerApp.get<RootRender>(TYPES.RootCreator)
const root = document.getElementById("root")

if (root) {
  rootCreator.render(root, () => containerApp.get<GameBox>(GameBox))
} else {
  throw Error("Not found root element")
}
