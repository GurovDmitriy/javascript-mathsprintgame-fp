import * as R from "ramda"
import type { ComponentStateless } from "../../interface"

export abstract class ComponentPure<TProps = any>
  implements ComponentStateless<TProps>
{
  public props: TProps
  private _propsCb: () => TProps

  public parentId: string
  public parentAttr: string
  public parentAttrId: string

  protected constructor() {
    this._propsCb = () => ({}) as TProps

    const attrGenerated = this._attrGenerator()
    this.parentId = attrGenerated.id
    this.parentAttr = attrGenerated.attr
    this.parentAttrId = attrGenerated.value

    this.props = {} as TProps
  }

  setProps(cb: () => TProps) {
    if (cb) this._propsCb = cb
    return this
  }

  public mount(): void {
    queueMicrotask(() => {
      R.pipe(
        () => this._elementFinder(),
        R.ifElse(
          (elementParent: Element | null) => Boolean(elementParent),
          (elementParent) => {
            this.props = this._propsCb()
            ;(elementParent as Element).innerHTML = this.render()
            requestAnimationFrame(() => {
              this.onMounted()
            })
          },
          R.T,
        ),
      )()
    })
  }

  destroy(): void {}

  onMounted(): void {}
  onDestroy(): void {}

  abstract render(): string

  private _elementFinder(): Element | null {
    if (document) {
      return document.querySelector(`[${this.parentAttrId}]`)
    } else {
      return null
    }
  }

  private _attrGenerator(): { attr: string; id: string; value: string } {
    const attr = "data-brainful-parent-id"
    const id = `brainful-${crypto.randomUUID()}`
    const value = `${attr}=${id}`

    return {
      attr,
      id,
      value,
    }
  }
}
