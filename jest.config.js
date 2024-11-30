import { createDefaultEsmPreset } from "ts-jest"

export default {
  ...createDefaultEsmPreset(),
  extensionsToTreatAsEsm: [".ts"],
  testEnvironment: "node",
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  transform: {
    "^.+\\.ts$": ["ts-jest", { useESM: true }],
  },
  setupFilesAfterEnv: ["<rootDir>/jest-setup.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  moduleDirectories: ["node_modules", "src"],
}
