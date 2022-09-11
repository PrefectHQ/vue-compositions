// https://stackoverflow.com/a/62557418/3511012
function globalExists(varName: string): boolean {
  const globalEval = eval
  try {
    globalEval(varName)
    return true
  } catch {
    return false
  }
}

export function getComputedStyleValue(element: Element, property: string): string | undefined {
  if (globalExists('window')) {
    try {
      return window
        .getComputedStyle(element, null)
        .getPropertyValue(property)
    } catch {
    // do nothing
    }
  }
}