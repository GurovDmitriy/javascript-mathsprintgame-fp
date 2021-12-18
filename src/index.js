/* eslint-disable no-unused-vars */

//
// for Function Programming
//

// core

import { compileResult } from "./core.js"

// function helpers

import {
  getRandom,
  getCorrectEquations,
  getWrongEquations,
  getEquationsArray,
  getShuffleArray,
} from "./helpers.js"

// middleware

import { checkTargetElem, checkMarkedSelect } from "./middlaware"

// Pages

const gamePage = document.getElementById("game-page")
const scorePage = document.getElementById("score-page")
const splashPage = document.getElementById("splash-page")
const countdownPage = document.getElementById("countdown-page")

// Splash Page

const startForm = document.getElementById("start-form")
const radioContainers = document.querySelectorAll(".radio-container")
const radioInputs = document.querySelectorAll("input")
const bestScores = document.querySelectorAll(".best-score-value")

// Countdown Page
const countdown = document.querySelector(".countdown")

// Game Page

const itemContainer = document.querySelector(".item-container")

// Score Page

const finalTimeEl = document.querySelector(".final-time")
const baseTimeEl = document.querySelector(".base-time")
const penaltyTimeEl = document.querySelector(".penalty-time")
const playAgainBtn = document.querySelector(".play-again")

// Other

const selectionContainer = document.querySelector(".selection-container")

// DOM settings

countdown.textContent = 3

// game state

let gameState = {
  isMarkedSelect: false,
  isShowCountDownPage: false,
  isShowSplashPage: true,
  isShowGamePage: false,
  countDownValue: countdown.textContent,
  markedValue: "",
  equationsArray: [],
  questionAmount: 0,
  correctEquations: 0,
  wrongEquations: 0,
}

const gameStateDefault = { ...gameState }

// function for game

function removeMarkerSelect(state) {
  radioContainers.forEach((elem) => elem.classList.remove("selected-label"))

  return Object.assign({}, state, { isMarkedSelect: false })
}

function setMarkerSelect(state) {
  const elem = document.querySelector(`#${state.markedValue}`)
  elem.parentElement.classList.add("selected-label")

  return Object.assign({}, state, { isMarkedSelect: true })
}

function setQuestionAmount(state) {
  const value = Number(state.markedValue.split("-")[1])

  return Object.assign({}, state, { questionAmount: value })
}

function setEquations(state) {
  const correct = getRandom(1, state.questionAmount)
  const incorrect = state.questionAmount - correct

  return Object.assign({}, state, {
    correctEquations: correct,
    wrongEquations: incorrect,
  })
}

function setEquationsArray(state) {
  const correctArray = getEquationsArray(
    state.correctEquations,
    getCorrectEquations
  )
  const wrongArray = getEquationsArray(state.wrongEquations, getWrongEquations)

  const equationsArray = [...correctArray, ...wrongArray]

  return Object.assign({}, state, { equationsArray })
}

function setShuffleEquationsArray(state) {
  const shuffleArray = getShuffleArray(state.equationsArray)

  return Object.assign({}, state, { equationsArray: shuffleArray })
}

function hideSplashPage(state) {
  splashPage.hidden = true

  return Object.assign({}, state, {
    isShowSplashPage: false,
  })
}

function showSplashPage(state) {
  splashPage.hidden = false

  return Object.assign({}, state, {
    isShowSplashPage: true,
  })
}

function hideCountDownPage(state) {
  countdownPage.hidden = true

  return Object.assign({}, state, {
    isShowCountDownPage: false,
  })
}

function showCountDownPage(state) {
  countdownPage.hidden = false

  return Object.assign({}, state, {
    isShowCountDownPage: true,
  })
}

function showGamePage(state) {
  gamePage.hidden = false

  return Object.assign({}, state, {
    isShowGamePage: true,
  })
}

function setCountDown(state) {
  const result = new Promise((resolve) => {
    let value = state.countDownValue

    ;(function count() {
      if (value === -1) {
        resolve(value)
        return
      }

      setTimeout(function () {
        value -= 1
        countdown.textContent = value
        count()
      }, 1000)
    })()
  })

  result.then(() => {
    runGame()
  })

  return Object.assign({}, state)
}

function addEquationsToDOM(state) {
  state.equationsArray.forEach((eq) => {
    const item = document.createElement("div")
    item.classList.add("item")

    const equationText = document.createElement("h1")
    equationText.textContent = eq.value

    item.appendChild(equationText)
    itemContainer.appendChild(item)
  })

  return Object.assign({}, state)
}

// mutations

function setResult(state) {
  gameState = { ...state }
}

// game

function selectQuestion(evt) {
  if (!checkTargetElem(evt)) return

  compileResult(
    removeMarkerSelect,
    setMarkerSelect,
    setQuestionAmount,
    setEquations,
    setEquationsArray,
    setShuffleEquationsArray,
    setResult
  )(Object.assign({}, gameState, { markedValue: evt.target.id }))
}

function startRound(evt) {
  evt.preventDefault()
  if (!checkMarkedSelect(gameState)) return

  compileResult(
    hideSplashPage,
    showCountDownPage,
    setCountDown,
    setResult
  )(Object.assign({}, gameState))
}

function runGame() {
  compileResult(
    hideCountDownPage,
    addEquationsToDOM,
    showGamePage,
    setResult
  )(Object.assign({}, gameState))

  console.log(gameState)
}

selectionContainer.addEventListener("click", selectQuestion)
startForm.addEventListener("submit", startRound)
