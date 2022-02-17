type Callable<T> = {
  [P in keyof T]: T[P] extends (...args: any[]) => any ? P : never
}[keyof T]

export function createActions<T extends Record<string, any>>(context: T): Pick<T, Callable<T>> {
  const keys = Object.keys(context).filter(key => typeof context[key] === 'function')
  const value = {} as Pick<T, Callable<T>>

  return keys.reduce<Pick<T, Callable<T>>>((output, method) => {
    output[method as Callable<T>] = context[method].bind(context)

    return output
  }, value)
}