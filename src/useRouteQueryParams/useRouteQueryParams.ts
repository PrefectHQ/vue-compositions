import { ref, Ref } from 'vue'
import { NoInfer } from '@/types/generics'
import { BooleanRouteParam, isRouteParamClass, NumberRouteParam, RouteParamClass, StringRouteParam } from '@/useRouteQueryParam/formats'
import { useRouteQueryParam } from '@/useRouteQueryParam/useRouteQueryParam'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRouteParamSchema = RouteParamsSchema<any>

export type RouteParamsSchema<T extends Record<string, unknown>> = {
  [P in keyof T]-?: T[P] extends Record<string, unknown>
    ? RouteParamsSchema<T[P]>
    : RouteParamClass<T[P]>
}

// export type RouteParamsDefaultValue<T extends AnyRouteParamSchema> = {
//   [P in keyof T]-?: T[P] extends AnyRouteParamSchema
//     ? RouteParamsDefaultValue<T[P]>
//     : T[P] extends RouteParamClass<infer C>
//       ? C
//       : never
// }

// export type RouteParams<T extends AnyRouteParamSchema> = {
//   [P in keyof T]-?: T[P] extends AnyRouteParamSchema
//     ? RouteParams<T[P]>
//     : T[P] extends RouteParamClass<infer C>
//       ? Ref<C>
//       : never
// }

// export type RouteParamsSchema<T extends Record<string, unknown>> = {
//   [P in keyof T]-?: T[P] extends Record<string, unknown>
//     ? RouteParamsSchema<T[P]>
//     : RouteParamClass<T[P]>
// }

export type RouteParams<T extends Record<string, unknown>> = {
  [P in keyof T]-?: T[P] extends Record<string, unknown>
    ? RouteParams<T[P]>
    : Ref<T[P]>
}

export function useRouteQueryParams<T extends Record<string, unknown>>(schema: RouteParamsSchema<T>, defaultValue: Required<NoInfer<T>>): RouteParams<T> {
  return getSchemaRouteQueryParams(schema, defaultValue)
}

function isRouteParamSchema<T extends Record<string, unknown>>(value: RouteParamsSchema<T> | unknown): value is RouteParamsSchema<T> {
  return !isRouteParamClass(value)
}

function getSchemaRouteQueryParams<T extends AnyRouteParamSchema>(
  schema: T,
  defaultValue: RouteParamsDefaultValue<NoInfer<T>>,
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

type Foo = {
  nested: {
    string: string,
    boolean: boolean,
    number: number,
  },
}

const foo = {
  nested: {
    string: StringRouteParam,
    boolean: BooleanRouteParam,
    number: NumberRouteParam,
  },
}

type Schema = RouteParamsSchema<Foo>
// type Default = RouteParamsDefaultValue<typeof foo>
type Params = RouteParams<Foo>

const schema: Schema = {
  nested: {
    string: StringRouteParam,
    boolean: BooleanRouteParam,
    number: NumberRouteParam,
  },
}

const defaults: Default = {
  nested: {
    string: '',
    boolean: false,
    number: 0,
  },
}

const params: Params = {
  nested: {
    string: ref(''),
    boolean: ref(false),
    number: ref(1),
  },
}

const object = useRouteQueryParams<Foo>(foo, {
  nested: {
    string: 'hello',
    boolean: false,
    number: 0,
  },
})

object.nested.boolean.value