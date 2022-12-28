/* eslint-disable no-redeclare */
import { computed, Ref } from 'vue'
import { NoInfer } from '@/types/generics'
import { MaybeArray } from '@/types/maybe'
import { useRouteQuery } from '@/useRouteQuery/useRouteQuery'
import { StringRouteParam } from '@/useRouteQueryParams/formats'
import { RouteParamClass } from '@/useRouteQueryParams/formats/RouteParam'


export function useRouteQueryParam<T = string>(key: string): Ref<T>
export function useRouteQueryParam<T>(key: string, formatter: RouteParamClass<T>, defaultValue: NoInfer<T>): Ref<T>
export function useRouteQueryParam<T>(key: string, formatter: RouteParamClass<T>, defaultValue: NoInfer<T>[]): Ref<T[]>
export function useRouteQueryParam<T>(key: string, formatter: RouteParamClass = StringRouteParam, defaultValue: MaybeArray = ''): Ref {
  const query = useRouteQuery()
  const format = new formatter(key, defaultValue)

  return computed({
    get() {
      return format.get(query)
    },
    set(value: T | T[]) {
      format.set(query, value)
    },
  })

}