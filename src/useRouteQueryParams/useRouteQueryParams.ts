import { Ref } from 'vue'
import { NoInfer } from '@/types/generics'
import { isRouteParamClass, RouteParamClass } from '@/useRouteQueryParam/formats'
import { useRouteQueryParam } from '@/useRouteQueryParam/useRouteQueryParam'

export type RouteQueryParamsSchema<T extends Record<string, unknown>> = {
  [P in keyof T]-?: T[P] extends Record<string, unknown>
    ? RouteQueryParamsSchema<T[P]>
    : RouteParamClass<T[P]>
}

export type RouteQueryParams<T extends Record<string, unknown>> = {
  [P in keyof T]-?: T[P] extends Record<string, unknown>
    ? RouteQueryParams<T[P]>
    : Ref<T[P]>
}

export function useRouteQueryParams<T extends Record<string, unknown>>(schema: RouteQueryParamsSchema<T>, defaultValue: NoInfer<T>): RouteQueryParams<T> {
  return getSchemaRouteQueryParams(schema, defaultValue)
}

function isRouteParamSchema<T extends Record<string, unknown>>(value: RouteQueryParamsSchema<T> | unknown): value is RouteQueryParamsSchema<T> {
  return !isRouteParamClass(value)
}

function getSchemaRouteQueryParams<T extends Record<string, unknown>>(
  schema: RouteQueryParamsSchema<T>,
  defaultValue: NoInfer<T>,
  prefix?: string,
): RouteQueryParams<T> {
  const prefixed = (key: string): string => {
    if (prefix) {
      return `${prefix}.${key}`
    }

    return key
  }

  const params = Object.keys(schema).reduce<Record<string, unknown>>((params, key) => {
    const property = schema[key]
    const propertyDefault = defaultValue[key]

    if (isRouteParamClass(property)) {
      params[key] = useRouteQueryParam(prefixed(key), property, propertyDefault)

      return params
    }

    if (isRouteParamSchema(property)) {
      const defaultSchemaValue = (propertyDefault ?? {}) as Record<string, unknown>

      params[key] = getSchemaRouteQueryParams(property, defaultSchemaValue, prefixed(key))

      return params
    }

    return params
  }, {})

  return params as RouteQueryParams<T>
}