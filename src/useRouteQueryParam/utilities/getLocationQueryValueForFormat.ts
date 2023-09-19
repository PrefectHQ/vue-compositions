import { LocationQuery, LocationQueryValue } from 'vue-router'
import { UseRouteQuery } from '@/useRouteQuery/useRouteQuery'
import { RouteParamClass } from '@/useRouteQueryParam/formats/RouteParam'
import { asArray } from '@/utilities/arrays'

function useFakeRouteQuery(): UseRouteQuery {
  const query: LocationQuery = {}

  function clear(): void {
    for (const prop of Object.getOwnPropertyNames(query)) {
      delete query[prop]
    }
  }

  function set(key: string, value: LocationQueryValue | LocationQueryValue[]): void {
    query[key] = value
  }

  function get(key: string): LocationQueryValue | LocationQueryValue[] {
    return query[key]
  }

  function remove(key: string): void {
    delete query[key]
  }

  return {
    query,
    clear,
    set,
    get,
    remove,
  }
}

export function getLocationQueryValueForFormat<T>(formatter: RouteParamClass<T>, value: T): LocationQueryValue | LocationQueryValue[]
export function getLocationQueryValueForFormat<T>(formatter: [RouteParamClass<T>], value: T[]): LocationQueryValue | LocationQueryValue[]
export function getLocationQueryValueForFormat<T>(formatter: RouteParamClass<T> | [RouteParamClass<T>], value: T | T[]): LocationQueryValue | LocationQueryValue[]
export function getLocationQueryValueForFormat<T>(formatter: RouteParamClass<T> | [RouteParamClass<T>], value: T | T[]): LocationQueryValue | LocationQueryValue[] {
  const key = 'dummy-key'
  const routeQuery = useFakeRouteQuery()
  const multiple = Array.isArray(formatter)
  const [FormatterConstructor] = asArray(formatter)
  const format = new FormatterConstructor({ multiple, key, defaultValue: value })

  format.set(routeQuery, value)

  return routeQuery.query[key]
}