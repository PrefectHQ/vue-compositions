import { RouteParamClass } from './RouteParam'

export function Optional<T>(param: RouteParamClass<T>): RouteParamClass<T | undefined> {
  return new Proxy(param, {
    construct(target, [key]: [string]) {
      const instance = new target(key)

      return new Proxy(instance, {
        get(target, property) {
          const value = Reflect.get(target, property)

          if (property === 'getSingleValue') {
            return new Proxy(value, {
              apply(getSingleValue, thisArg, args) {
                const value = Reflect.apply(getSingleValue, thisArg, args)

                if (value === thisArg.default) {
                  return undefined
                }

                return value
              },
            })
          }

          return value
        },
      })
    },
  })
}
