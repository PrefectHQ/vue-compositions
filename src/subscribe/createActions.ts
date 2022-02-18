type AnyFunction = (...args: unknown[]) => unknown
type Callable<T> = keyof {
  [P in keyof T as T[P] extends AnyFunction ? P : never]: T[P]
}

export function createActions<T extends Record<string, unknown>>(context: T): Pick<T, Callable<T>> {
  const value = {} as Pick<T, Callable<T>>

  return Object.keys(context).reduce<Pick<T, Callable<T>>>((output, key) => {
    const possiblyMethod = context[key]

    if (typeof possiblyMethod === 'function') {
      output[key as Callable<T>] = possiblyMethod.bind(context)
    }

    return output
  }, value)
}