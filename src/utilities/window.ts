import { globalExists } from './global'

export function getWindowComputedStyle(element: Element | undefined): CSSStyleDeclaration | undefined {
  if (!globalExists('window') || !element) {
    return undefined
  }

  return window.getComputedStyle(element)
}