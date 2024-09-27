// @ts-check
const eslint = require("@eslint/js")
const tseslint = require("typescript-eslint")

module.exports = tseslint.config(
  {
    ignores: [],
  },
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
)
