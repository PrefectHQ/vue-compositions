import { RouteParamClass } from '@/useRouteQueryParam/formats/RouteParam'


export function Optional<T>(param: RouteParamClass<T>): RouteParamClass<T | undefined> {
  return new Proxy(param, {
    construct(target, params: ConstructorParameters<RouteParamClass<T>>) {
      console.log({ params })
      return new target(...params)
    },
  }) as RouteParamClass<T | undefined>
}
// export function Optional<T>(param: RouteParamClass<T>): RouteParamClass<T | undefined> {
//   let useDefault = true

//   // proxy the constructor
//   return new Proxy(param, {
//     construct(target, params: ConstructorParameters<RouteParamClass<T>>) {
//       const instance = new target(...params)

//       // proxy the constructed instance
//       return new Proxy(instance, {

//         get(target, property, receiver) {
//           const value = Reflect.get(target, property, receiver)

//           if (property === 'get' && !useDefault) {
//             return optionalGet(value)
//           }

//           if (property === 'set') {
//             useDefault = false
//             return optionalSet(value)
//           }

//           return value

//         },
//       })
//     },
//   }) as RouteParamClass<T | undefined>
// }

// type RouteParamGet<T> = InstanceType<RouteParamClass<T>>['get']

// function optionalGet<T>(method: RouteParamGet<T>): RouteParamGet<T | undefined> {
//   return new Proxy(method, {
//     apply(target, thisArg: InstanceType<RouteParamClass<T>>, args: Parameters<RouteParamGet<T>>) {
//       const [routeQuery] = args
//       const { key } = thisArg

//       if (!(key in routeQuery.query)) {
//         return undefined
//       }

//       return Reflect.apply(target, thisArg, args)
//     },
//   })
// }

// type RouteParamSet<T> = InstanceType<RouteParamClass<T>>['set']

// function optionalSet<T>(method: RouteParamSet<T>): RouteParamSet<T | undefined> {
//   return new Proxy(method, {
//     apply(target, thisArg: InstanceType<RouteParamClass<T>>, args: Parameters<RouteParamSet<T>>) {
//       const [routeQuery, value] = args
//       const { key } = thisArg

//       if (value === undefined) {
//         routeQuery.remove(key)
//         return
//       }

//       return Reflect.apply(target, thisArg, args)
//     },
//   })
// }