import { LocationQuery, LocationQueryValue } from 'vue-router'
import { RouteParamClass } from '@/useRouteQueryParam/formats/RouteParam'
import { asArray } from '@/utilities/arrays'

export function getLocationQueryValueForFormat<T>(formatter: RouteParamClass<T>, value: T): LocationQueryValue | LocationQueryValue[]
export function getLocationQueryValueForFormat<T>(formatter: [RouteParamClass<T>], value: T[]): LocationQueryValue | LocationQueryValue[]
export function getLocationQueryValueForFormat<T>(formatter: RouteParamClass<T> | [RouteParamClass<T>], value: T | T[]): LocationQueryValue | LocationQueryValue[]
export function getLocationQueryValueForFormat<T>(formatter: RouteParamClass<T> | [RouteParamClass<T>], value: T | T[]): LocationQueryValue | LocationQueryValue[] {
  const key = 'dummy-key'
  const query: LocationQuery = {}
  const multiple = Array.isArray(formatter)
  const [FormatterConstructor] = asArray(formatter)
  const format = new FormatterConstructor({ multiple, key, defaultValue: value })

  format.set(query, value)

  return query[key]
}