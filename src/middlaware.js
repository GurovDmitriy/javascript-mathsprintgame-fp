export function checkTargetElem(elem) {
  return elem.target.type === "radio"
}

export function checkMarkedSelect(state) {
  return state.isMarkedSelect
}
