import { Ref } from 'vue'
import { NoInfer } from '@/types/generics'
import { useRouteQueryParam } from '@/useRouteQueryParam/useRouteQueryParam'
import { isRouteParamClass, RouteParamClass } from '@/useRouteQueryParams/formats'

export type RouteParamsSchema<T extends Record<string, unknown>> = {
  [P in keyof T]-?: T[P] extends Record<string, unknown> ? RouteParamsSchema<T[P]> : RouteParamClass<T[P]>
}

export type RouteParams<T extends Record<string, unknown>> = {
  [P in keyof T]-?: T[P] extends Record<string, unknown> ? RouteParams<T[P]> : Ref<T[P]>
}

export function useRouteQueryParams<T extends Record<string, unknown>>(schema: RouteParamsSchema<T>, defaultValue: NoInfer<T>): RouteParams<T> {
  return getSchemaRouteQueryParams(schema, defaultValue)
}

function isRouteParamSchema<T extends Record<string, unknown>>(value: RouteParamsSchema<T> | unknown): value is RouteParamsSchema<T> {
  return !isRouteParamClass(value)
}

function getSchemaRouteQueryParams<T extends Record<string, unknown>>(
  schema: RouteParamsSchema<T>,
  defaultValue: NoInfer<T>,
  prefix?: string,
): RouteParams<T> {
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

      params[key] = getSchemaRouteQueryParams(property, defaultSchemaValue, key)

      return params
    }

    return params
  }, {})

  return params as RouteParams<T>
}