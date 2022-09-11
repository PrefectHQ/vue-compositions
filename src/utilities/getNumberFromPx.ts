export function getNumberFromPx(sizeWithPx: string | undefined): number {
  const exec = /([\d]*)px/.exec(sizeWithPx ?? '')

  if (exec && exec.length === 2) {
    return parseInt(exec[1])
  }

  return 0
}