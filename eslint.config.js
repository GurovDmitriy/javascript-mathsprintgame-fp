// @ts-check
import eslint from "@eslint/js"
import tseslint from "typescript-eslint"

export default tseslint.config(
  {
    ignores: ["dist", ".parcel-cache"],
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
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/ban-ts-comment": "off",
    },
  },
)
