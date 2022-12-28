/* eslint-disable no-redeclare */
import { computed, Ref } from 'vue'
import { NoInfer } from '@/types/generics'
import { MaybeArray } from '@/types/maybe'
import { useRouteQuery } from '@/useRouteQuery/useRouteQuery'
import { isNotRouteParamClass, isRouteParamClass, RouteParamClass } from '@/useRouteQueryParam/formats/RouteParam'
import { StringRouteParam } from '@/useRouteQueryParam/formats/StringRouteParam'

export function useRouteQueryParam(key: string, defaultValue?: string): Ref<string>
export function useRouteQueryParam(key: string, defaultValue: string[]): Ref<string[]>
export function useRouteQueryParam<T>(key: string, formatter: RouteParamClass<T>, defaultValue: NoInfer<T>): Ref<T>
export function useRouteQueryParam<T>(key: string, formatter: RouteParamClass<T>, defaultValue: NoInfer<T>[]): Ref<T[]>
export function useRouteQueryParam(key: string, formatterOrDefaultValue?: RouteParamClass | MaybeArray<string>, maybeDefaultValue: MaybeArray = ''): Ref {
  const query = useRouteQuery()
  const formatter = isRouteParamClass(formatterOrDefaultValue) ? formatterOrDefaultValue : StringRouteParam
  const defaultValue = isNotRouteParamClass(formatterOrDefaultValue) ? formatterOrDefaultValue : maybeDefaultValue
  const format = new formatter(key, defaultValue)

  return computed({
    get() {
      return format.get(query)
    },
    set(value) {
      format.set(query, value)
    },
  })

}