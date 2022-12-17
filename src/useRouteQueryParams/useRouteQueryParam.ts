/* eslint-disable no-redeclare */
import { computed, Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NoInfer } from '@/types/generics'
import { RouteParamClass } from '@/useRouteQueryParams/formats/RouteParam'

export function useRouteQueryParam<T>(key: string, formatter: RouteParamClass<T>, defaultValue: NoInfer<T>): Ref<T>
export function useRouteQueryParam<T>(key: string, formatter: RouteParamClass<T>, defaultValue: NoInfer<T>[]): Ref<T[]>
export function useRouteQueryParam<T>(key: string, formatter: RouteParamClass<T>, defaultValue: NoInfer<T> | NoInfer<T>[]): Ref<T | T[]> {
  const route = useRoute()
  const router = useRouter()
  const format = new formatter(key, defaultValue)

  return computed({
    get() {
      return format.get(route.query)
    },
    set(value: T | T[]) {
      const query = format.set(route.query, value)

      router.push(query)
    },
  })

}