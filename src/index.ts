import "reflect-metadata"

import { container } from "./app/CompositionRoot/container"
import { TYPES } from "./app/CompositionRoot/types"
import { SelectQuestion } from "./feature/SelectQuestion/SelectQuestion"

// TODO: add testing
// TODO: add Bridge pattern for GameModel
// TODO: handle error custom and real exception

const setQuestion = container.get<SelectQuestion>(TYPES.QuestionValue)
setQuestion.init()
