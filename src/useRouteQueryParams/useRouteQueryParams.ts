/* eslint-disable no-redeclare */
import { computed, Ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { isInvalidRouteParamValue } from './formats/InvalidRouteParamValue'
import { RouteParamClass } from './formats/RouteParam'
import { NoInfer } from '@/types/generics'
import { asArray } from '@/utilities/arrays'

export function useRouteQueryParam<T>(key: string, formatter: RouteParamClass<T>, defaultValue: NoInfer<T>): Ref<T>
export function useRouteQueryParam<T>(key: string, formatter: [RouteParamClass<T>], defaultValue: NoInfer<T>[]): Ref<T[]>
export function useRouteQueryParam<T>(key: string, formatter: RouteParamClass<T> | [RouteParamClass<T>], defaultValue: NoInfer<T> | NoInfer<T>[]): Ref<T | T[]> {
  const route = useRoute()
  const router = useRouter()
  const [formatterClass] = asArray(formatter)
  const { getSingleValue, getArrayValue, setSingleValue, setArrayValue } = new formatterClass(key)

  if (Array.isArray(defaultValue)) {
    let useDefaultValue = true

    const unwatch = watch(() => getArrayValue(route.query), () => {
      useDefaultValue = false
      unwatch()
    })

    return computed({
      get() {
        const value = getArrayValue(route.query)

        if (value.length === 0 && useDefaultValue) {
          return defaultValue
        }

        return value
      },
      set(values: T[]) {
        const query = setArrayValue(route.query, values)

        router.push({ query })
      },
    })
  }

  return computed({
    get() {
      const value = getSingleValue(route.query)

      if (isInvalidRouteParamValue(value)) {
        return defaultValue
      }

      return value
    },
    set(value: T) {
      const query = setSingleValue(route.query, value)

      router.push({ query })
    },
  })
}