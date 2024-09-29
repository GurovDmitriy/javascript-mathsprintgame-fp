import "reflect-metadata"

import { container } from "./app/CompositionRoot/container"
import { QuizPass } from "./feature/QuizPass"
import { SelectQuestion } from "./feature/SelectQuestion"
import { StartGame } from "./feature/StartGame"

// TODO: add testing
// TODO: test handlerError custom and real exception
// TODO: use render fn with html template

const setQuestion = container.get<SelectQuestion>(SelectQuestion)
setQuestion.init()

const startGame = container.get<StartGame>(StartGame)
startGame.init()

const quizPass = container.get<QuizPass>(QuizPass)
quizPass.init()
