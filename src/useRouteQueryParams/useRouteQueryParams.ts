/* eslint-disable no-redeclare */
import { computed, Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { RouteParamClass } from './formats/RouteParam'
import { asArray } from '@/utilities/arrays'

export function useRouteQueryParam<T>(key: string, formatter: RouteParamClass<T>): Ref<T>
export function useRouteQueryParam<T>(key: string, formatter: [RouteParamClass<T>]): Ref<T[]>
export function useRouteQueryParam<T>(key: string, formatter: RouteParamClass<T> | [RouteParamClass<T>]): Ref<T | T[]> {
  const route = useRoute()
  const router = useRouter()
  const multiple = Array.isArray(formatter)
  const [formatterClass] = asArray(formatter)
  const { getSingleValue, getArrayValue, setSingleValue, setArrayValue } = new formatterClass(key)

  if (multiple) {
    return computed({
      get() {
        return getArrayValue(route.query)
      },
      set(values: T[]) {
        const query = setArrayValue(route.query, values)

        router.push({ query })
      },
    })
  }

  return computed({
    get() {
      return getSingleValue(route.query)
    },
    set(value: T) {
      const query = setSingleValue(route.query, value)

      router.push({ query })
    },
  })
}