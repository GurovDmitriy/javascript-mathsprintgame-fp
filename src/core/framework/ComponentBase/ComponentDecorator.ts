// import {
//   BehaviorSubject,
//   debounceTime,
//   distinctUntilChanged,
//   Subject,
//   takeUntil,
//   tap,
// } from "rxjs"
// import { ComponentStateful } from "../../interface/Component"
//
// export function ComponentDecorator<
//   T extends new (...args: any[]) => ComponentStateful,
// >(constructor: T) {
//   return class extends constructor {
//     public readonly idParent: string
//
//     public readonly idParentAttr: string
//
//     public props: any
//
//     // protected readonly stateSubject
//     // public readonly state: Observable<any>
//
//     stateSubject = new BehaviorSubject<any>(super.setInitState())
//     state = this.stateSubject.asObservable()
//
//     public readonly unsubscribe = new Subject<void>()
//
//     constructor(...args: any[]) {
//       super(...args)
//
//       this.idParent = this.idGenerator()
//       this.idParentAttr = `data-painful-idparent="${this.idParent}"`
//
//       this.props = {} as any
//
//       this.create()
//     }
//
//     private idGenerator(): string {
//       return crypto.randomUUID()
//     }
//
//     create(): void {
//       queueMicrotask(() => {
//         this.init()
//       })
//
//       queueMicrotask(() => {
//         const elementParent = document.querySelector(
//           `[data-painful-idparent="${this.idParent}"]`,
//         )
//
//         if (elementParent) {
//           elementParent.innerHTML = this.render()
//
//           requestAnimationFrame(() => {
//             if (elementParent) {
//               this.mounted()
//             }
//           })
//         }
//       })
//
//       this.state
//         .pipe(
//           takeUntil(this.unsubscribe),
//           distinctUntilChanged((prev, curr) => Object.is(prev, curr)),
//           debounceTime(100),
//           tap(() => {
//             requestAnimationFrame(() => {
//               const elementParent = document.querySelector(
//                 `[data-painful-idparent="${this.idParent}"]`,
//               )
//
//               if (elementParent) {
//                 elementParent.innerHTML = this.render()
//
//                 requestAnimationFrame(() => {
//                   this.updated()
//                 })
//               }
//             })
//           }),
//         )
//         .subscribe()
//
//       if (typeof super.create === "function") {
//         super.create()
//       }
//     }
//
//     init(): void {
//       if (typeof super.init === "function") {
//         super.init()
//       }
//     }
//
//     mounted(): void {
//       if (typeof super.mounted === "function") {
//         super.mounted()
//       }
//     }
//
//     updated(): void {
//       if (typeof super.updated === "function") {
//         super.updated()
//       }
//     }
//
//     destroy(): void {
//       requestAnimationFrame(() => {
//         this.unsubscribe.next()
//         this.unsubscribe.complete()
//
//         if (typeof super.destroy === "function") {
//           super.destroy()
//         }
//       })
//     }
//
//     render(): string {
//       if (typeof super.render === "function") {
//         return super.render()
//       } else {
//         return ""
//       }
//     }
//   }
// }
