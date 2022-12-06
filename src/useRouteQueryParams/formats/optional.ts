import { RouteParamClass } from './RouteParam'

export function Optional<T>(param: RouteParamClass<T>): RouteParamClass<T | undefined> {
  return new Proxy(param, {
    construct(target, params: ConstructorParameters<RouteParamClass<T>>) {
      const instance = new target(...params)

      return new Proxy(instance, {
        get(target, property) {
          const value = Reflect.get(target, property)

          if (property === 'default') {
            return undefined
          }

          return value
        },
      })
    },
  })
}
