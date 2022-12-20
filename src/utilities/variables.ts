export function isSame(valueA: unknown, valueB: unknown): boolean {
  return JSON.stringify(valueA) === JSON.stringify(valueB)
}