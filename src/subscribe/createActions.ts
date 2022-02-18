type AnyFunction = (...args: any[]) => any
type Callable<T> = keyof {
  [P in keyof T as T[P] extends AnyFunction ? P : never]: T[P]
}

export function createActions<T extends Record<string, any>>(context: T): Pick<T, Callable<T>> {
  const keys = Object.keys(context).filter(key => typeof context[key] === 'function')
  const value = {} as Pick<T, Callable<T>>

  return keys.reduce<Pick<T, Callable<T>>>((output, method) => {
    output[method as Callable<T>] = context[method].bind(context)

    return output
  }, value)
}