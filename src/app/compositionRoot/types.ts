export const TYPES = {
  // Classes
  ErrorHeavy: Symbol.for("class.ErrorHeavy"),
  ErrorLight: Symbol.for("class.ErrorLight"),
  ErrorReadable: Symbol.for("class.ErrorReadable"),

  // Factories
  ErrorHeavyFactory: Symbol.for("factory.ErrorHeavy"),
  ErrorLightFactory: Symbol.for("factory.ErrorLight"),
  ErrorReadableFactory: Symbol.for("factory.ErrorReadable"),

  // Services
  ErrorGlobalHandler: Symbol.for("service.ErrorGlobalHandler"),
  ErrorHandler: Symbol.for("service.ErrorHandler"),
  Game: Symbol.for("service.Game"),
  GameConfig: Symbol.for("service.GameConfig"),
  ErrorConfig: Symbol.for("service.ErrorConfig"),
  Remote: Symbol.for("service.Remote"),
}
