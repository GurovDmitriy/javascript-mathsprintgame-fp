import { injectable } from "inversify"
import { GAME_ERROR_CODE } from "../../domain/Game"
import { type ErrorConfig } from "../../interfaces"

@injectable()
export class ErrorConfiguration implements ErrorConfig {
  config = {
    [GAME_ERROR_CODE.questionNotSelected]: {
      message: "You not select count question",
      level: "log",
      code: 200,
    } as any,
  }
}
