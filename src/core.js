const pipe =
  (f, g) =>
  (...args) =>
    g(f(...args))

export function compileResult(...fns) {
  return fns.reduce(pipe)
}
