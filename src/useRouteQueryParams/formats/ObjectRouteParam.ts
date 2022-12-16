import { flatten, unflatten } from 'flat'
import { LocationQuery, LocationQueryValue } from 'vue-router'
import { isNotInvalidRouteParamValue } from '@/useRouteQueryParams/formats/InvalidRouteParamValue'
import { RouteParam, RouteParamClass } from '@/useRouteQueryParams/formats/RouteParam'

export type ObjectRouteParamSchema<T extends Record<string, unknown>> = {
  [P in keyof T]-?: T[P] extends Record<string, unknown> ? ObjectRouteParamSchema<T[P]> : RouteParamClass<NonNullable<T[P]>>
}

export abstract class ObjectRouteParam<T extends Record<string, unknown>> extends RouteParam<T> {
  protected abstract schema: ObjectRouteParamSchema<T>

  protected override parse(): T {
    throw new Error('Not Implemented')
  }

  protected override format(): LocationQueryValue {
    throw new Error('Not Implemented')
  }

  public override getSingleValue(query: LocationQuery): T {
    const schema: Record<string, RouteParamClass<unknown>> = flatten(this.schema)
    const response: Record<string, unknown> = {}

    Object.entries(schema).forEach(([key, formatter]) => {
      const format = new formatter(`${this.key}.${key}`)
      const value = format.getSingleValue(query)

      if (isNotInvalidRouteParamValue(value)) {
        response[key] = format.getSingleValue(query)
      }
    })

    return unflatten(response) as T
  }

  public override getArrayValue(): T[] {
    throw new Error('Not Implemented')
  }

  public override setSingleValue(currentQuery: LocationQuery, value: T): LocationQuery {
    const schema: Record<string, RouteParamClass<unknown>> = flatten(this.schema)
    const valueFlat: Record<string, unknown> = flatten(value)
    let query: LocationQuery = { ...currentQuery }

    Object.entries(schema).forEach(([key, formatter]) => {
      const format = new formatter(`${this.key}.${key}`)

      query = format.setSingleValue(query, valueFlat[key])
    })

    return query
  }

  public override setArrayValue(): LocationQuery {
    throw new Error('Not Implemented')
  }

}