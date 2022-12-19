import { computed, reactive, Ref } from 'vue'
import { LocationQuery, useRoute, useRouter } from 'vue-router'
import { NoInfer } from '@/types/generics'
import { isRouteParamClass, RouteParamClass } from '@/useRouteQueryParams/formats'
import { useRouteQuery } from '@/useRouteQueryParams/useRouteQuery'

export type RouteParamsSchema<T extends Record<string, unknown>> = {
  [P in keyof T]-?: T[P] extends Record<string, unknown> ? RouteParamsSchema<T[P]> : RouteParamClass<T[P]>
}

export type RouteParams<T extends Record<string, unknown>> = {
  [P in keyof T]-?: T[P] extends Record<string, unknown> ? RouteParams<T[P]> : Ref<T[P]>
}

function useRouteQueryParams<T extends Record<string, unknown>>(schema: RouteParamsSchema<T>, defaultValue: NoInfer<T>): T {
  const route = useRoute()
  const router = useRouter()
  const { query, get, set } = useRouteQuery()

  // use schema as the "template"
  // wrap that in reactive
  // debounce the router push?
  // profit?
  const params = getSchemaRouteQueryParams(query, schema, defaultValue)

}

function isRouteParamSchema<T extends Record<string, unknown>>(value: RouteParamsSchema<T> | unknown): value is RouteParamsSchema<T> {
  return !isRouteParamClass(value)
}

function getSchemaRouteQueryParams<T extends Record<string, unknown>>(
  query: LocationQuery,
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
      const format = new property(prefixed(key), propertyDefault)

      params[key] = computed({
        get() {
          return format.get(query)
        },
        set(value) {
          format.set(query, value)
        },
      })

      return params
    }

    if (isRouteParamSchema(property)) {
      params[key] = getSchemaRouteQueryParams(property, propertyDefault ?? {}, key)

      return params
    }

    return params
  }, {})

  return params as RouteParams<T>
}