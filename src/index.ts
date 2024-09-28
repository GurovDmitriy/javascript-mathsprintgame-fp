import "reflect-metadata"

import { container } from "./app/CompositionRoot/container"
import { SelectQuestion } from "./feature/SelectQuestion/SelectQuestion"
import { StartGame } from "./feature/StartGame/StartGame"

// TODO: add testing
// TODO: add Bridge pattern for GameModel
// TODO: handle error custom and real exception

const setQuestion = container.get<SelectQuestion>(SelectQuestion)
setQuestion.init()

const startGame = container.get<StartGame>(StartGame)
startGame.init()
