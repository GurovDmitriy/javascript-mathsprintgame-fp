/* eslint-disable no-unused-vars */

//
// OOP
//

// class MathSprintGame {
//   prop = value

//   constructor() {
//     this.name = name
//   }

//   logName(value) {
//     console.log(this._name + value)
//   }

//   get name() {
//     return this._name
//   }

//   set name(value) {
//     if (value !== "dima") return
//     this._name = value
//   }
// }

// const game = new MathSprintGame()

// console.log(game)

//
// functional programming
//

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

// Equations
let questionAmount = 0
let equationsArray = []
let playerGuessArray = []
let bestScoreArray = []

// Game Page
let firstNumber = 0
let secondNumber = 0
let equationObject = {}
const wrongFormat = []

// Time
let timer
let timePlayed = 0
let baseTime = 0
let penaltyTime = 0
let finalTime = 0
let finalTimeDisplay = "0.0"

// Scroll
let valueY = 0

// core

const pipe =
  (f, g) =>
  (...args) =>
    g(f(...args))

function compileResult(...fns) {
  return fns.reduce(pipe)
}

// game state

let gameState = {
  isMarkedSelect: false,
  markedValue: "",
}

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

// mutations

function setResult(state) {
  gameState = { ...state }
}

// game

function selectQuestion(evt) {
  if (evt.target.type !== "radio") return

  compileResult(
    removeMarkerSelect,
    setMarkerSelect,
    setResult
  )(Object.assign({}, gameState, { markedValue: evt.target.id }))
}

// function startGame() {
//   console.log("start game")

//   compileResult(setMarkerSelect, setResult)(Object.assign({}, gameState))

//   console.log(gameState)
// }

selectionContainer.addEventListener("click", selectQuestion)
