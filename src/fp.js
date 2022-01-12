// Pages

const elemPageSplash = document.getElementById("splash-page")
const elemPageCountdown = document.getElementById("countdown-page")
const elemPageGame = document.getElementById("game-page")
const elemPageScore = document.getElementById("score-page")
const elemPageError = document.getElementById("error-page")

// Elem

const elemNavigation = document.querySelector(".navigation")
const elemCaptionCountdown = document.querySelector(".countdown__caption")
const elemCaptionError = document.querySelector(".error__caption")
const elemQuiz = document.querySelector(".quiz")
const elemQuestions = document.querySelector(".questions")

// Elems

const elemsQuestion = document.querySelectorAll(".input-box")

// Btns

const elemBtnStart = document.querySelector(".btn--start")
const elemBtnsQuiz = document.querySelector(".btn-quiz-box")
const elemBtnWrong = document.querySelector(".btn--wrong")
const elemBtnRight = document.querySelector(".btn--right")
const elemBtnPlayAgain = document.querySelector(".btn--play-again")

// Score

const elemFinalTime = document.querySelector(
  ".table-score__item--final-time > td"
)
const elemBaseTime = document.querySelector(
  ".table-score__item--base-time > td"
)
const elemPenaltyTime = document.querySelector(
  ".table-score__item--penalty-time > td"
)

// Game state

let gameState = {
  isPageSplashShow: true,
  isPageCountdownShow: false,
  isPageGameShow: false,
  isPageScoreShow: false,
  isPageErrorShow: false,
  isBtnsQuizShow: false,
  isBtnStartShow: true,
  isBtnPlayAgainShow: false,
  isBtnStartPush: false,
  isChoiceMade: false,
  isQuestionEnd: false,
  markedValue: null,
  countdownValue: 3,
  scrollPosition: 0,
  scrollToEnd: 0,
  scrollStep: null,
  activeQuestion: 1,
  equationsArray: null,
  equationsRight: 0,
  equationsWrong: 0,
  guessArray: null,
  questionAmount: 0,
  quizPenalty: 1500,
  quizResult: null,
  timeQuizStep: 10,
  timeQuiz: 0,
  timeQuizFinal: 0,
  timeQuizPenalty: 0,
  timeQuizFormatted: null,
  timeQuizFinalFormatted: null,
  timeQuizPenaltyFormatted: null,
  error: null,
}

const gameStateDefault = { ...gameState }

// Core

const pipe =
  (f, g) =>
  (...args) =>
    g(f(...args))

function pipeRunner(...fns) {
  return fns.reduce(pipe)
}

// Error Custom

class ErrorCustom extends Error {
  constructor(message) {
    super(message)
    this.name = "ErrorCustom"
  }
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
  const equation = `${firstNumber} <span>x</span> ${secondNumber} <span>=</span> ${equationValue}`
  return { value: equation, evaluated: true }
}

function getWrongEquations() {
  const firstNumber = getRandom(0, 9)
  const secondNumber = getRandom(0, 9)
  const equationValue = firstNumber * secondNumber
  const equations = [
    `${
      firstNumber + 1
    } <span>x</span> ${secondNumber} <span>=</span> ${equationValue}`,
    `${firstNumber} <span>x</span> ${
      secondNumber + 1
    } <span>=</span> ${equationValue}`,
    `${firstNumber} <span>x</span> ${secondNumber} <span>=</span> ${
      equationValue + 1
    }`,
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

function getTimeFormattedBestScoreStr(obj) {
  const hr = obj.hr || null
  const min = obj.min || null
  const sec = obj.sec || null
  const ms = obj.ms || null

  let timeStr = "0"

  if (hr) {
    timeStr = `${obj.hr}h:${obj.min}m:${obj.sec}s:${obj.ms}ms`
  } else if (min) {
    timeStr = `${obj.min}m:${obj.sec}s:${obj.ms}ms`
  } else if (sec) {
    timeStr = `${obj.sec}s:${obj.ms}ms`
  } else if (ms) {
    timeStr = `${obj.ms}ms`
  }

  return timeStr
}

function getDataStorage(key) {
  return JSON.parse(localStorage.getItem(key))
}

function setDataStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

// Middlaware

function checkTargetElem(evt) {
  return !evt.target.classList.contains("input-box")
}

function checkChoiceMade(state) {
  return state.isChoiceMade === false
}

function checkPageGameHidden(state) {
  return state.isPageGameShow === false
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
  elemBtnStart.focus()

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

function showPageError(state) {
  elemPageError.hidden = false

  return Object.assign({}, state, {
    isPageErrorShow: true,
  })
}

function hidePageError(state) {
  elemPageError.hidden = true

  return Object.assign({}, state, {
    isPageErrorShow: false,
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

function showBtnsQuiz(state) {
  elemBtnsQuiz.classList.add("btn-quiz-box--active")

  return Object.assign({}, state, { isBtnsQuizShow: true })
}

function hideBtnsQuiz(state) {
  elemBtnsQuiz.classList.remove("btn-quiz-box--active")

  return Object.assign({}, state, { isBtnsQuizShow: false })
}

function showBtnPlayAgain(state) {
  elemBtnPlayAgain.hidden = false
  elemBtnPlayAgain.focus()

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
  })
    .then((timeQuiz) => stopTimeQuiz(timeQuiz))
    .catch((err) => showErrorCustom(err))

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
  })
    .then(() => {
      runGame()
    })
    .catch((err) => showErrorCustom(err))

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

    item.insertAdjacentHTML("beforeend", eq.value)

    box.appendChild(item)
  })

  elemQuiz.appendChild(box)

  return Object.assign({}, state)
}

// Scroll

function setScrollValues(state) {
  const elemItemQuizHeight =
    document.querySelector(".quiz__item").clientHeight + 20
  const elemScrollHeight = elemNavigation.scrollHeight
  const elemClientHeight = elemNavigation.clientHeight
  const scrollToEnd = elemScrollHeight - elemClientHeight

  return Object.assign({}, state, {
    scrollToEnd,
    scrollStep: elemItemQuizHeight,
  })
}

function scrollForm(state) {
  let value = state.scrollPosition

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

// Guess

function setGuess(state, guess) {
  const guessArray = state.guessArray ? [...state.guessArray] : []
  guessArray.push(guess)

  return Object.assign({}, state, { guessArray })
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

function setScorePageSplash(state) {
  let saveGame = getDataStorage("MathSprintGame") || null

  if (saveGame) {
    for (let item in saveGame) {
      const selector = `label[for="value-${item}"] .best-score__value`
      const elemBestScore = document.querySelector(selector)

      const timeFormatted = getTimeFormatted(saveGame[item])
      const timeFormattedStr = getTimeFormattedBestScoreStr(timeFormatted)

      elemBestScore.textContent = timeFormattedStr
    }
  }

  return Object.assign({}, state)
}

function setScoreStorage(state) {
  let saveGame = getDataStorage("MathSprintGame") || null
  let saveGameNew = {}
  const keyQuestion = String(state.questionAmount)
  const valueNew = state.timeQuizFinal
  let valueOld = null

  if (saveGame && saveGame[keyQuestion]) {
    valueOld = saveGame[keyQuestion]
  }

  if (valueOld && valueOld > valueNew) {
    saveGame[keyQuestion] = valueNew
    saveGameNew = {
      ...saveGame,
    }
  } else {
    saveGameNew = {
      [keyQuestion]: state.timeQuizFinal,
      ...saveGame,
    }
  }

  setDataStorage("MathSprintGame", saveGameNew)

  return Object.assign({}, state)
}

// Mutations

function setResult(state) {
  gameState = { ...state }
}

// Error

function logError(state) {
  const startSearch = state.error.stack.indexOf(" at ", 0)
  const endSearch = state.error.stack.indexOf("(", startSearch)
  const errorFunction = state.error.stack.slice(startSearch, endSearch).trim()

  console.log(
    `Error ${String.fromCodePoint(0x26d4)}

    ${String.fromCodePoint(0x1f41e)} ${state.error.message}
    ${String.fromCodePoint(0x1f381)} ${errorFunction}
    `
  )

  return Object.assign({}, state)
}

function addErrorMessage(state) {
  elemCaptionError.textContent = state.error.message

  return Object.assign({}, state)
}

// Game

function selectQuestion(evt) {
  try {
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
  } catch (err) {
    throw new ErrorCustom("Error preparing data for the game")
  }
}

function startRound() {
  try {
    if (checkChoiceMade(gameState)) return
    if (checkBtnPlayPush(gameState)) return

    pipeRunner(
      disableBtnStart,
      hidePageSplash,
      showPageCountdown,
      setCountdown,
      setResult
    )(Object.assign({}, gameState))
  } catch (err) {
    throw new ErrorCustom("Error countdown timer")
  }
}

function runGame() {
  try {
    if (checkCountdownValue(gameState)) return

    pipeRunner(
      hidePageCountdown,
      hideBtnStart,
      addEquationsToDOM,
      showPageGame,
      setScrollValues,
      showBtnsQuiz,
      startTimeQuiz,
      setResult
    )(Object.assign({}, gameState))
  } catch (err) {
    throw new ErrorCustom("Error run quiz")
  }
}

function btnsGuessPush(guess) {
  try {
    if (checkQuestionEnd(gameState)) return
    if (checkPageGameHidden(gameState)) return

    pipeRunner(
      setGuess,
      scrollForm,
      setActiveQuestion,
      setResult
    )(Object.assign({}, gameState), guess)
  } catch (err) {
    throw new ErrorCustom("Error push buttons quiz")
  }
}

function stopTimeQuiz(time) {
  try {
    pipeRunner(
      setResultQuiz,
      setResultTime,
      setTimeQuizFormatted,
      hidePageGame,
      addResultGameToDOM,
      hideBtnsQuiz,
      showPageScore,
      setScoreStorage,
      setScorePageSplash,
      showBtnPlayAgain,
      setResult
    )(Object.assign({}, gameState, { timeQuiz: time }))
  } catch (err) {
    throw new ErrorCustom("Error stop time quiz")
  }
}

function playAgain() {
  try {
    if (checkBtnPlayAgainPush(gameState)) return

    pipeRunner(
      hidePageError,
      hideBtnPlayAgain,
      hidePageScore,
      removeMarkedChoice,
      showPageSplash,
      showBtnStart,
      setResult
    )(Object.assign({}, gameStateDefault))
  } catch (err) {
    throw new ErrorCustom("Error play again")
  }
}

function showErrorCustom(err) {
  pipeRunner(
    logError,
    hidePageSplash,
    hidePageCountdown,
    hidePageGame,
    hidePageScore,
    hideBtnStart,
    hideBtnsQuiz,
    addErrorMessage,
    showPageError,
    showBtnPlayAgain,
    setResult
  )(Object.assign({}, gameState, { error: err, isBtnPlayAgainShow: true }))
}

// Listeners

// Select question

elemQuestions.addEventListener("click", (evt) => {
  try {
    selectQuestion(evt)
  } catch (err) {
    showErrorCustom(err)
  }
})

// Start round btn

elemBtnStart.addEventListener("click", () => {
  try {
    startRound()
  } catch (err) {
    showErrorCustom(err)
  }
})

// Player guess

elemBtnWrong.addEventListener("click", () => {
  try {
    btnsGuessPush(false)
  } catch (err) {
    showErrorCustom(err)
  }
})

elemBtnRight.addEventListener("click", () => {
  try {
    btnsGuessPush(true)
  } catch (err) {
    showErrorCustom(err)
  }
})

window.addEventListener("keydown", (evt) => {
  try {
    switch (evt.key) {
      case "ArrowLeft":
      case "w":
        btnsGuessPush(false)
        break
      case "ArrowRight":
      case "r":
        btnsGuessPush(true)
        break
    }
  } catch (err) {
    showErrorCustom(err)
  }
})

// Play again

elemBtnPlayAgain.addEventListener("click", () => {
  try {
    playAgain()
  } catch (err) {
    showErrorCustom(err)
  }
})

// Get score storage

setScorePageSplash()
