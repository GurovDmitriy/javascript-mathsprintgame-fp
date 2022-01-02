/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

const elemNavigation = document.querySelector(".navigation")

// Pages

const elemPageSplash = document.getElementById("splash-page")
const elemPageCountdown = document.getElementById("countdown-page")
const elemPageGame = document.getElementById("game-page")
const elemPageScore = document.getElementById("score-page")

// Splash Page

const elemForm = document.querySelector(".form")
const elemBtnStart = document.querySelector(".btn--start")
const elemsQuestion = document.querySelectorAll(".input-box")

// Countdown Page

const elemCaptionCountdown = document.querySelector(".countdown__caption")

// Game Page

const elemQuiz = document.querySelector(".quiz")
const elemBoxBtnsQuiz = document.querySelector(".btn-quiz-box")
const elemBtnWrong = document.querySelector(".btn--wrong")
const elemBtnRight = document.querySelector(".btn--right")
const elemQuestions = document.querySelector(".questions")

// Score Page

const elemFinalTime = document.querySelector(
  ".table-score__item--final-time > td"
)
const elemBaseTime = document.querySelector(
  ".table-score__item--base-time > td"
)
const elemPenaltyTime = document.querySelector(
  ".table-score__item--penalty-time > td"
)

const elemBtnPlayAgain = document.querySelector(".btn--play-again")

// Core

const pipe =
  (f, g) =>
  (...args) =>
    g(f(...args))

function pipeRunner(...fns) {
  return fns.reduce(pipe)
}

// Helpers

function getRandom(min = 0, max = 5) {
  let rand = min - 0.5 + Math.random() * (max - min + 1)
  return Math.round(rand)
}

function getRightEquations() {
  const firstNumber = getRandom(0, 9)
  const secondNumber = getRandom(0, 9)
  const equationValue = firstNumber * secondNumber
  const equation = `${firstNumber} x ${secondNumber} = ${equationValue}`
  return { value: equation, evaluated: true }
}

function getWrongEquations() {
  const firstNumber = getRandom(0, 9)
  const secondNumber = getRandom(0, 9)
  const equationValue = firstNumber * secondNumber
  const equations = [
    `${firstNumber + 1} x ${secondNumber} = ${equationValue}`,
    `${firstNumber} x ${secondNumber + 1} = ${equationValue}`,
    `${firstNumber + 1} x ${secondNumber} = ${equationValue + 1}`,
  ]
  const equation = equations[getRandom(0, equations.length - 1)]

  return { value: equation, evaluated: false }
}

function getEquationsArray(limit, equationsFunc) {
  const resultArr = []

  for (let i = 0; i < limit; i++) {
    resultArr.push(equationsFunc())
  }

  return resultArr
}

function getShuffleArray(arr) {
  const resultArr = [...arr]

  let currentIndex = resultArr.length,
    randomIndex

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1
    ;[resultArr[currentIndex], resultArr[randomIndex]] = [
      resultArr[randomIndex],
      resultArr[currentIndex],
    ]
  }

  return resultArr
}

function getTimeFormatted(milleseconds) {
  const ms = milleseconds % 1000
  let sec = Math.floor(milleseconds / 1000)
  let min = Math.floor(sec / 60)
  let hr = Math.floor(min / 60)

  sec = sec >= 60 ? sec % 60 : sec
  min = min >= 60 ? min % 60 : min

  return { ms, sec, min, hr }
}

function getTimeFormattedStr(obj) {
  const timeStr = `${obj.hr}h : ${obj.min}m : ${obj.sec}s : ${obj.ms}ms`

  return timeStr
}

function getDataStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key))
  } catch (err) {
    console.log("Error getting data from localStorage", e)
    throw new Error(e.message, err)
  }
}

function setDataStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (err) {
    console.log("Error saving data in localStorage", err)
    throw new Error(e.message, err)
  }
}

// Middlaware

function checkTargetElem(evt) {
  return !evt.target.classList.contains("input-box")
}

function checkChoiceMade(state) {
  return state.isChoiceMade === false
}

function checkBtnPlayPush(state) {
  return state.isBtnStartPush === true
}

function checkBtnPlayAgainPush(state) {
  return state.isBtnPlayAgainShow === false
}

function checkCountdownValue(state) {
  return state.countdownValue !== 0
}

function checkQuestionEnd(state) {
  return state.isQuestionEnd === true
}

// Game state

let gameState = {
  isPageSplashShow: true,
  isPageCountdownShow: false,
  isPageGameShow: false,
  isPageScoreShow: false,
  isBoxBtnsQuizBoxShow: false,
  isBtnStartShow: true,
  isBtnPlayAgainShow: false,
  isBtnStartPush: false,
  isChoiceMade: false,
  isQuestionEnd: false,
  markedValue: null,
  countdownValue: 3,
  scrollPosition: 0,
  scrollToEnd: 0,
  scrollStep: 60,
  activeQuestion: 1,
  equationsArray: null,
  equationsRight: 0,
  equationsWrong: 0,
  guessArray: null,
  questionAmount: 0,
  quizPenalty: 500,
  quizResult: null,
  timeQuizStep: 10,
  timeQuiz: 0,
  timeQuizFinal: 0,
  timeQuizPenalty: 0,
  timeQuizFormatted: null,
  timeQuizFinalFormatted: null,
  timeQuizPenaltyFormatted: null,
}

const gameStateDefault = { ...gameState }

// Function for game

function setMarkedValue(state) {
  const target = state.markedValue
  const value = target.querySelector("input").id

  return Object.assign({}, state, { markedValue: value })
}

function removeMarkedChoice(state) {
  elemsQuestion.forEach((elem) => elem.classList.remove("input-box--active"))

  return Object.assign({}, state, { isChoiceMade: false })
}

function setMarkedChoice(state) {
  const elem = document.getElementById(`${state.markedValue}`)
  elem.parentElement.classList.add("input-box--active")

  return Object.assign({}, state, { isChoiceMade: true })
}

function setQuestionAmount(state) {
  const value = Number(state.markedValue.split("-")[1])

  return Object.assign({}, state, { questionAmount: value })
}

function setEquationsCount(state) {
  const equationsRight = getRandom(1, state.questionAmount)
  const equationsWrong = state.questionAmount - equationsRight

  return Object.assign({}, state, {
    equationsRight,
    equationsWrong,
  })
}

function setEquationsArray(state) {
  const rightArray = getEquationsArray(state.equationsRight, getRightEquations)
  const wrongArray = getEquationsArray(state.equationsWrong, getWrongEquations)

  const equationsArray = [...rightArray, ...wrongArray]

  return Object.assign({}, state, { equationsArray })
}

function setShuffleEquationsArray(state) {
  const shuffleArray = getShuffleArray(state.equationsArray)

  return Object.assign({}, state, { equationsArray: shuffleArray })
}

// Enable - Disable elem

function enableBtnStart(state) {
  elemBtnStart.disabled = false

  return Object.assign({}, state, { isBtnStartPush: false })
}

function disableBtnStart(state) {
  elemBtnStart.disabled = true

  return Object.assign({}, state, { isBtnStartPush: true })
}

// Show - Hide elem page

function showPageSplash(state) {
  elemPageSplash.hidden = false

  return Object.assign({}, state, {
    isPageSplashShow: true,
  })
}

function hidePageSplash(state) {
  elemPageSplash.hidden = true

  return Object.assign({}, state, {
    isPageSplashShow: false,
  })
}

function showPageCountdown(state) {
  elemPageCountdown.hidden = false

  return Object.assign({}, state, {
    isPageCountdownShow: true,
  })
}

function hidePageCountdown(state) {
  elemPageCountdown.hidden = true

  return Object.assign({}, state, {
    isPageCountdownShow: false,
  })
}

function showPageGame(state) {
  elemPageGame.hidden = false

  return Object.assign({}, state, {
    isPageGameShow: true,
  })
}

function hidePageGame(state) {
  elemPageGame.hidden = true

  return Object.assign({}, state, {
    isPageGameShow: false,
  })
}

function showPageScore(state) {
  elemPageScore.hidden = false

  return Object.assign({}, state, {
    isPageScoreShow: true,
  })
}

function hidePageScore(state) {
  elemPageScore.hidden = true

  return Object.assign({}, state, {
    isPageScoreShow: false,
  })
}

// Show - Hide elem btn

function showBtnStart(state) {
  elemBtnStart.hidden = false

  return Object.assign({}, state, { isBtnStartShow: true })
}

function hideBtnStart(state) {
  elemBtnStart.hidden = true

  return Object.assign({}, state, { isBtnStartShow: false })
}

function showBoxBtnsQuiz(state) {
  elemBoxBtnsQuiz.classList.add("btn-quiz-box--active")

  return Object.assign({}, state, { isBoxBtnsQuizShow: true })
}

function hideBoxBtnsQuiz(state) {
  elemBoxBtnsQuiz.classList.remove("btn-quiz-box--active")

  return Object.assign({}, state, { isBoxBtnsQuizShow: false })
}

function showBtnPlayAgain(state) {
  elemBtnPlayAgain.hidden = false

  return Object.assign({}, state, { isBtnPlayAgainShow: true })
}

function hideBtnPlayAgain(state) {
  elemBtnPlayAgain.hidden = true

  return Object.assign({}, state, { isBtnPlayAgainShow: false })
}

// Time

function startTimeQuiz(state) {
  new Promise((resolve) => {
    let time = state.timeQuiz
    const step = state.timeQuizStep

    const timer = setInterval(() => {
      if (gameState.isQuestionEnd) {
        clearInterval(timer)
        resolve(time)
      } else {
        time += step
      }
    }, step)
  }).then((timeQuiz) => stopTimeQuiz(timeQuiz))

  return Object.assign({}, state)
}

function setCountdown(state) {
  elemCaptionCountdown.textContent = state.countdownValue

  new Promise((resolve) => {
    let value = state.countdownValue

    ;(function count() {
      if (value === -1) {
        resolve(value)
        return
      }

      setTimeout(function () {
        value -= 1
        elemCaptionCountdown.textContent = value
        count()
      }, 1000)
    })()
  }).then(() => {
    runGame()
  })

  return Object.assign({}, state, { countdownValue: 0 })
}

function addEquationsToDOM(state) {
  elemQuiz.innerHTML = ""

  const box = document.createElement("div")

  state.equationsArray.forEach((eq, index) => {
    const item = document.createElement("p")
    item.classList.add("quiz__item")

    if (index === 0) {
      item.classList.add("quiz__item--active")
    }

    item.textContent = eq.value

    box.appendChild(item)
  })

  elemQuiz.appendChild(box)

  return Object.assign({}, state)
}

function setScrollValues(state) {
  const elemScrollHeight = elemNavigation.scrollHeight
  const elemClientHeight = elemNavigation.clientHeight
  const scrollToEnd = elemScrollHeight - elemClientHeight

  return Object.assign({}, state, { scrollToEnd })
}

function setGuess(state, guess) {
  const guessArray = state.guessArray ? [...state.guessArray] : []
  guessArray.push(guess)

  return Object.assign({}, state, { guessArray })
}

function scrollForm(state) {
  value = state.scrollPosition

  if (state.scrollPosition < state.scrollToEnd) {
    value += state.scrollStep
  } else {
    value = state.scrollToEnd
  }

  elemNavigation.scroll({
    top: value,
    left: 0,
    behavior: "smooth",
  })

  return Object.assign({}, state, { scrollPosition: value })
}

function setActiveQuestion(state) {
  let activeQuestion = state.activeQuestion
  const prevQuestion = document.querySelector(".quiz__item--active")
  const nextQuestion = document.querySelector(
    ".quiz__item--active + .quiz__item"
  )

  if (activeQuestion === state.questionAmount) {
    activeQuestion = null
    state.isQuestionEnd = true
    prevQuestion.classList.remove("quiz__item--active")
  } else {
    activeQuestion += 1
    prevQuestion.classList.remove("quiz__item--active")
    nextQuestion.classList.add("quiz__item--active")
  }

  return Object.assign({}, state, { activeQuestion })
}

function setTimeQuizFormatted(state) {
  const timeQuiz = state.timeQuiz
  const timeQuizFinal = state.timeQuizFinal
  const timeQuizPenalty = state.timeQuizPenalty
  const timeQuizFormatted = getTimeFormatted(timeQuiz)
  const timeQuizFinalFormatted = getTimeFormatted(timeQuizFinal)
  const timeQuizPenaltyFormatted = getTimeFormatted(timeQuizPenalty)

  return Object.assign({}, state, {
    timeQuizFormatted,
    timeQuizFinalFormatted,
    timeQuizPenaltyFormatted,
  })
}

function setResultQuiz(state) {
  let wrongGuess = 0
  let rightGuess = 0

  state.equationsArray.forEach((item, index) => {
    if (item.evaluated === state.guessArray[index]) {
      rightGuess += 1
    } else {
      wrongGuess += 1
    }
  })

  return Object.assign({}, state, { quizResult: { wrongGuess, rightGuess } })
}

function setResultTime(state) {
  const penalty = state.quizPenalty
  const timeQuizPenalty = state.quizResult.wrongGuess * penalty

  const timeQuizFinal = state.timeQuiz + timeQuizPenalty

  return Object.assign({}, state, { timeQuizFinal, timeQuizPenalty })
}

function addResultGameToDOM(state) {
  elemFinalTime.textContent = getTimeFormattedStr(state.timeQuizFinalFormatted)
  elemBaseTime.textContent = getTimeFormattedStr(state.timeQuizFormatted)
  elemPenaltyTime.textContent = getTimeFormattedStr(
    state.timeQuizPenaltyFormatted
  )

  return Object.assign({}, state)
}

// LocalStorage

function setScoreStorage(state) {
  let saveGame = getDataStorage("MathSprintGame") || {}
  const keyQuestion = String(state.questionAmount)

  saveGameNew = {
    [keyQuestion]: {
      timeQuizFinalFormatted: state.timeQuizFinalFormatted,
    },
    ...saveGame,
  }

  setDataStorage("MathSprintGame", saveGameNew)

  return Object.assign({}, state)
}

// Mutations

function setResult(state) {
  gameState = { ...state }
}

// Game

function selectQuestion(evt) {
  if (checkTargetElem(evt)) return

  pipeRunner(
    setMarkedValue,
    removeMarkedChoice,
    setMarkedChoice,
    setQuestionAmount,
    setEquationsCount,
    setEquationsArray,
    setShuffleEquationsArray,
    enableBtnStart,
    setResult
  )(
    Object.assign({}, gameState, {
      markedValue: evt.target,
    })
  )
}

function startRound() {
  if (checkChoiceMade(gameState)) return
  if (checkBtnPlayPush(gameState)) return

  pipeRunner(
    disableBtnStart,
    hidePageSplash,
    showPageCountdown,
    setCountdown,
    setResult
  )(Object.assign({}, gameState))
}

function runGame() {
  if (checkCountdownValue(gameState)) return

  pipeRunner(
    hidePageCountdown,
    hideBtnStart,
    addEquationsToDOM,
    showPageGame,
    setScrollValues,
    showBoxBtnsQuiz,
    startTimeQuiz,
    setResult
  )(Object.assign({}, gameState))
}

function btnsGuessPush(guess) {
  if (checkQuestionEnd(gameState)) return

  pipeRunner(
    setGuess,
    scrollForm,
    setActiveQuestion,
    setResult
  )(Object.assign({}, gameState), guess)
}

function stopTimeQuiz(time) {
  pipeRunner(
    setResultQuiz,
    setResultTime,
    setTimeQuizFormatted,
    hidePageGame,
    addResultGameToDOM,
    hideBoxBtnsQuiz,
    showPageScore,
    setScoreStorage,
    showBtnPlayAgain,
    setResult
  )(Object.assign({}, gameState, { timeQuiz: time }))

  console.log("state after STOPTIMER: ", gameState)
}

function playAgain() {
  if (checkBtnPlayAgainPush(gameState)) return

  pipeRunner(
    hideBtnPlayAgain,
    hidePageScore,
    removeMarkedChoice,
    showPageSplash,
    showBtnStart,
    setResult
  )(Object.assign({}, gameStateDefault))

  console.log("state after PLAYAGAIN: ", gameState)
}

// Listeners

// Remove default submit form

elemForm.addEventListener("submit", (evt) => evt.preventDefault())

// Select question

elemQuestions.addEventListener("click", selectQuestion)

// Start round btn

elemBtnStart.addEventListener("click", startRound)

// Player guess

elemBtnWrong.addEventListener("click", () => btnsGuessPush(false))
elemBtnRight.addEventListener("click", () => btnsGuessPush(true))

// Play again

elemBtnPlayAgain.addEventListener("click", playAgain)
