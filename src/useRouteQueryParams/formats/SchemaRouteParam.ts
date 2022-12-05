// eslint-disable-next-line max-classes-per-file
import { flatten, unflatten } from 'flat'
import { LocationQuery } from 'vue-router'
import { BooleanRouteParam } from './BooleanRouteParam'
import { NumberRouteParam } from './NumberRouteParam'
import { Optional } from './optional'
import { RouteParam, RouteParamClass } from './RouteParam'
import { StringRouteParam } from './StringRouteParam'

// type RouteParamSchema<T extends Record<string, unknown>> = {
//   [P in keyof T]-?: T[P] extends Record<string, unknown> ? RouteParamSchema<T[P]> : RouteParamClass<NonNullable<T[P]>>
// }

type RouteParamSchema<T extends Record<string, unknown>> = {
  [P in keyof T]-?: T[P] extends Record<string, unknown>
    ? RouteParamSchema<T[P]>
    : Extract<T[P], undefined> extends never
      ? RouteParamClass<NonNullable<T[P]>>
      : RouteParamClass<T[P]>
}

type test = RouteParamSchema<DummyFilter>

export abstract class SchemaRouteParam<T extends Record<string, unknown>> extends RouteParam<T> {
  protected abstract schema: RouteParamSchema<T>

  protected parse(): T {
    throw new Error('Not Implemented')
  }

  protected format(): string {
    throw new Error('Not Implemented')
  }

  public getSingleValue(query: LocationQuery): T {
    const schema: Record<string, RouteParamClass<unknown>> = flatten(this.schema)
    const response: Record<string, unknown> = {}

    Object.entries(schema).forEach(([key, formatter]) => {
      const { getSingleValue } = new formatter(key)

      response[key] = getSingleValue(query)
    })

    return unflatten(response) as T
  }

  public getArrayValue(): T[] {
    throw new Error('Not Implemented')
  }

  public setSingleValue(currentQuery: LocationQuery, value: T): LocationQuery {
    const schema: Record<string, RouteParamClass<unknown>> = flatten(this.schema)
    const valueFlat: Record<string, unknown> = flatten(value)
    let query: LocationQuery = { ...currentQuery }

    Object.entries(schema).forEach(([key, formatter]) => {
      const { setSingleValue } = new formatter(key)

      query = setSingleValue(query, valueFlat[key])
    })

    return query
  }

  public setArrayValue(): LocationQuery {
    throw new Error('Not Implemented')
  }

}

type DummyFilter = {
  foo?: number,
  bar?: string,
  fiz: {
    buz: boolean,
  },
}

export class FilterRouteParam extends SchemaRouteParam<DummyFilter> {
  protected override default: DummyFilter = {
    foo: 1,
    fiz: {
      buz: true,
    },
  }

  protected override schema = {
    foo: Optional(NumberRouteParam),
    bar: Optional(StringRouteParam),
    fiz: {
      buz: BooleanRouteParam,
    },
  }
}