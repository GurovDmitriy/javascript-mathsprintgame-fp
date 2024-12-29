import { injectable } from "inversify"
import { GAME_ERROR_CODE } from "../../domain/Game"
import { type ErrorConfig, ErrorConfigMap } from "../../interfaces"

@injectable()
export class ErrorConfiguration implements ErrorConfig {
  config: ErrorConfigMap = {
    [GAME_ERROR_CODE.questionNotSelected]: {
      message: "You not select count question",
      code: 200,
      level: "log",
      location: "local",
    },
  }
}
