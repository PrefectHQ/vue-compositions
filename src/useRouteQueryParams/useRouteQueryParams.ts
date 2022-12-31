import { Ref } from 'vue'
import { NoInfer } from '@/types/generics'
import { isRouteParamClass, RouteParamClass } from '@/useRouteQueryParam/formats'
import { useRouteQueryParam } from '@/useRouteQueryParam/useRouteQueryParam'

type AnyRecord = Record<string, unknown>

export type RouteQueryParamsSchema<T extends AnyRecord> = {
  [P in keyof T]-?: NonNullable<T[P]> extends AnyRecord
    ? RouteQueryParamsSchema<NonNullable<T[P]>>
    : RouteParamClass<NonNullable<T[P]>>
}

export type RouteQueryParams<T extends AnyRecord> = {
  [P in keyof T]-?: [T[P]] extends [AnyRecord | undefined]
    ? [T[P]] extends [AnyRecord]
      ? RouteQueryParams<T[P]>
      : RouteQueryParams<Partial<T[P]>>
    : Ref<T[P]>
}

export function useRouteQueryParams<T extends AnyRecord>(schema: RouteQueryParamsSchema<T>, defaultValue: NoInfer<T>): RouteQueryParams<T> {
  return getSchemaRouteQueryParams(schema, defaultValue)
}

function isRouteParamSchema<T extends AnyRecord>(value: RouteQueryParamsSchema<T> | unknown): value is RouteQueryParamsSchema<T> {
  return !isRouteParamClass(value)
}

function getSchemaRouteQueryParams<T extends AnyRecord>(
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

  const params = Object.keys(schema).reduce<AnyRecord>((params, key) => {
    const property = schema[key]
    const propertyDefault = defaultValue[key]

    if (isRouteParamClass(property)) {
      params[key] = useRouteQueryParam(prefixed(key), property, propertyDefault)

      return params
    }

    if (isRouteParamSchema(property)) {
      const defaultSchemaValue = (propertyDefault ?? {}) as AnyRecord

      params[key] = getSchemaRouteQueryParams(property, defaultSchemaValue, prefixed(key))

      return params
    }

    return params
  }, {})

  return params as RouteQueryParams<T>
}