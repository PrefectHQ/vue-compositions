/* eslint-disable no-redeclare */
import { computed, Ref } from 'vue'
import { NoInfer } from '@/types/generics'
import { MaybeArray } from '@/types/maybe'
import { useRouteQuery } from '@/useRouteQuery/useRouteQuery'
import { isRouteParamClass, RouteParamClass } from '@/useRouteQueryParam/formats/RouteParam'
import { StringRouteParam } from '@/useRouteQueryParam/formats/StringRouteParam'

function isDefaultValue<T>(value: T | RouteParamClass): value is T {
  return !isRouteParamClass(value)
}

export function useRouteQueryParam(key: string, defaultValue?: string): Ref<string>
export function useRouteQueryParam(key: string, defaultValue: string[]): Ref<string[]>
export function useRouteQueryParam<T>(key: string, formatter: RouteParamClass<T>, defaultValue: NoInfer<T>): Ref<T>
export function useRouteQueryParam<T>(key: string, formatter: RouteParamClass<T>, defaultValue: NoInfer<T>[]): Ref<T[]>
export function useRouteQueryParam<T>(key: string, formatter: RouteParamClass<T>, defaultValue: MaybeArray<NoInfer<T>>): Ref<MaybeArray<T>>
export function useRouteQueryParam(key: string, formatterOrDefaultValue?: RouteParamClass | MaybeArray<string>, maybeDefaultValue?: MaybeArray): Ref {

  const isStringParamWithNoDefaultValue = formatterOrDefaultValue === undefined

  if (isStringParamWithNoDefaultValue) {
    return useRouteQueryParam(key, '')
  }

  const isStringParamWithDefaultValue = isDefaultValue(formatterOrDefaultValue)

  if (isStringParamWithDefaultValue) {
    return useRouteQueryParam(key, StringRouteParam, formatterOrDefaultValue)
  }

  const query = useRouteQuery()
  const formatter = formatterOrDefaultValue
  const defaultValue = maybeDefaultValue
  const format = new formatter({ key, defaultValue })

  return computed({
    get() {
      return format.get(query)
    },
    set(value) {
      format.set(query, value)
    },
  })

}