export function getRandom(min = 0, max = 5) {
  let rand = min - 0.5 + Math.random() * (max - min + 1)
  return Math.round(rand)
}

export function getCorrectEquations() {
  const firstNumber = getRandom(0, 9)
  const secondNumber = getRandom(0, 9)
  const equationValue = firstNumber * secondNumber
  const equation = `${firstNumber} x ${secondNumber} = ${equationValue}`
  return { value: equation, evaluated: true }
}

export function getWrongEquations() {
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

export function getEquationsArray(limit, equationsFunc) {
  const resultArr = []

  for (let i = 0; i < limit; i++) {
    resultArr.push(equationsFunc())
  }

  return resultArr
}

export function getShuffleArray(arr) {
  const resultArr = [...arr]

  let currentIndex = resultArr.length,
    randomIndex

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--
    ;[resultArr[currentIndex], resultArr[randomIndex]] = [
      resultArr[randomIndex],
      resultArr[currentIndex],
    ]
  }

  return resultArr
}
