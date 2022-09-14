import { reduceToRecord } from './arrays'
import { globalExists } from './global'
import { kebabCase } from './strings'

export type ComputedStyleRecord = Record<keyof CSSStyleDeclaration, string>

export function getComputedStyleRecord(element: Element | undefined): ComputedStyleRecord | undefined {
  if (!globalExists('window') || !element) {
    return undefined
  }

  const computedStyle = window.getComputedStyle(element)

  return reduceToRecord(Object.keys(computedStyle),
    key => key as keyof CSSStyleDeclaration,
    key => {
      const kebab = kebabCase(key)

      return computedStyle.getPropertyValue(kebab)
    },
  )
}