import { Children } from "@brainfuljs/brainful"
import { List, Map } from "immutable"

export function childrenIterator(stateSubject: any): {
  forEach: (cb: (c: Children) => void) => void
} {
  return {
    forEach: (cb: (c: Children) => void) => {
      const traversal = (c: any) => {
        if (Map.isMap(c)) {
          cb(c.get("component") as any)
        }

        if (List.isList(c)) {
          c.forEach((c) => traversal(c))
        }
      }

      stateSubject
        .getValue()
        .get("children")
        .forEach((c: any) => traversal(c))
    },
  }
}
