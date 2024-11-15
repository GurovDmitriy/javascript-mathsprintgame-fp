import { ComponentStateful } from "./ComponentStateful.js"

export type Children<TNames = any> = {
  [K in TNames as string]: {
    value: K
    component: ComponentStateful
  }
}
