import { LocationQuery } from 'vue-router'
import { isRouteParamClass, isRouteParamClassTuple } from '@/useRouteQueryParam/formats/RouteParam'
import { getLocationQueryValueForFormat } from '@/useRouteQueryParam/utilities'
import { RouteQueryParamsSchema, isRouteParamSchema } from '@/useRouteQueryParams'
import { isRecord } from '@/utilities/objects'

export function getLocationQueryForSchema<T extends Record<string, unknown>>(schema: RouteQueryParamsSchema<T>, value: T, prefix?: string): LocationQuery {
  const prefixed = (key: string): string => {
    if (prefix) {
      return `${prefix}.${key}`
    }

    return key
  }

  const locationQuery: LocationQuery = {}

  Object.keys(schema).forEach(key => {
    const propertyFormat = schema[key]
    const propertyKey = prefixed(key)
    const propertyValue = value[key]

    if (isRouteParamClass(propertyFormat) || isRouteParamClassTuple(propertyFormat)) {
      locationQuery[propertyKey] = getLocationQueryValueForFormat(propertyFormat, propertyValue)
      return
    }

    if (isRouteParamSchema(propertyFormat) && isRecord(propertyValue)) {
      const nestedLocationQuery = getLocationQueryForSchema(propertyFormat, propertyValue, propertyKey)

      Object.entries(nestedLocationQuery).forEach(([key, value]) => {
        locationQuery[key] = value
      })
    }
  })

  return locationQuery
}