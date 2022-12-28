/* eslint-disable no-redeclare */
import { computed, Ref } from 'vue'
import { NoInfer } from '@/types/generics'
import { useRouteQuery } from '@/useRouteQuery/useRouteQuery'
import { StringRouteParam } from '@/useRouteQueryParams/formats'
import { RouteParamClass } from '@/useRouteQueryParams/formats/RouteParam'


export function useRouteQueryParam<T>(key: string): Ref<string>
export function useRouteQueryParam<T>(key: string, formatter: RouteParamClass<T>, defaultValue: NoInfer<T>): Ref<T>
export function useRouteQueryParam<T>(key: string, formatter: RouteParamClass<T>, defaultValue: NoInfer<T>[]): Ref<T[]>
export function useRouteQueryParam<T>(key: string, formatter: RouteParamClass<T> | RouteParamClass<string> = StringRouteParam, defaultValue: NoInfer<T> | NoInfer<T>[] | string = ''): Ref<T | string | T[]> {
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