import { globalExists } from './global'

export function getComputedStyleRecord(element: Element | undefined): CSSStyleDeclaration | undefined {
  if (!globalExists('window') || !element) {
    return undefined
  }

  return window.getComputedStyle(element)
}