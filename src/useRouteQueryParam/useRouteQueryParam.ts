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

export function useRouteQueryParam(key: string, defaultValue?: string): Ref<string | undefined>
export function useRouteQueryParam(key: string, defaultValue: string): Ref<string>
export function useRouteQueryParam(key: string, defaultValue: string[]): Ref<string[]>
export function useRouteQueryParam(key: string, defaultValue: MaybeArray<string>): Ref<MaybeArray<string>>
export function useRouteQueryParam(key: string, defaultValue: MaybeArray<string> | undefined): Ref<MaybeArray<string> | undefined>
export function useRouteQueryParam<T>(key: string, formatter: RouteParamClass<T>, defaultValue: NoInfer<T>): Ref<T>
export function useRouteQueryParam<T>(key: string, formatter: RouteParamClass<T>, defaultValue: NoInfer<T> | undefined): Ref<T | undefined>
export function useRouteQueryParam<T>(key: string, formatter: RouteParamClass<T>, defaultValue: NoInfer<T>[]): Ref<T[]>
export function useRouteQueryParam<T>(key: string, formatter: RouteParamClass<T>, defaultValue: MaybeArray<T>): Ref<MaybeArray<T>>
export function useRouteQueryParam<T>(key: string, formatter: RouteParamClass<T>, defaultValue: MaybeArray<T> | undefined): Ref<MaybeArray<T> | undefined>
export function useRouteQueryParam(key: string, formatterOrDefaultValue?: RouteParamClass | MaybeArray<string> | undefined, maybeDefaultValue?: MaybeArray | undefined): Ref {

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