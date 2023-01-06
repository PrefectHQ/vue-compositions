import { LocationQueryValue } from 'vue-router'
import { UseRouteQuery } from '@/useRouteQuery/useRouteQuery'
import { InvalidRouteParamValue, isInvalidRouteParamValue, isNotInvalidRouteParamValue } from '@/useRouteQueryParam/formats/InvalidRouteParamValue'
import { asArray } from '@/utilities/arrays'

const IS_ROUTE_PARAM_SYMBOL: unique symbol = Symbol()

export type RouteParamClassArgs<T> = {
  key: string,
  defaultValue: T | T[],
}

// adding any here so RouteParamClass can be used without passing a generic
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RouteParamClass<T = any> = new (args: RouteParamClassArgs<T>) => RouteParam<T>

export function isRouteParamClass(value: unknown): value is RouteParamClass<unknown> {
  return typeof value === 'function' && IS_ROUTE_PARAM_SYMBOL in value
}

export abstract class RouteParam<T> {
  public static [IS_ROUTE_PARAM_SYMBOL] = true

  protected abstract parse(value: LocationQueryValue): T
  protected abstract format(value: T): LocationQueryValue

  protected key: string
  protected defaultValue: T | T[] | null | undefined

  private get multiple(): boolean {
    return Array.isArray(this.defaultValue)
  }

  private get isNullable(): boolean {
    return this.defaultValue === null
  }

  private get isOptional(): boolean {
    return this.defaultValue === undefined
  }

  public constructor({ key, defaultValue }: RouteParamClassArgs<T>) {
    this.key = key
    this.defaultValue = defaultValue
  }

  public get(routeQuery: UseRouteQuery): T | T[] | null | undefined {
    if (!(this.key in routeQuery.query)) {
      return this.defaultValue
    }

    const value = routeQuery.get(this.key)

    if (value === null && this.isNullable) {
      return null
    }

    const strings = asArray(value)
    const values = strings.map(value => this.safeParseValue(value)).filter(isNotInvalidRouteParamValue)

    if (this.multiple) {
      return values
    }

    const [first] = values

    return first
  }

  public set(routeQuery: UseRouteQuery, value: T | T[] | null | undefined): void {
    if (value === undefined) {
      return routeQuery.remove(this.key)
    }

    const values = asArray(value)
    const strings = values.map(value => this.safeFormatValue(value)).filter(isNotInvalidRouteParamValue)

    if (strings.length === 0) {
      return routeQuery.remove(this.key)
    }

    if (this.multiple) {
      return routeQuery.set(this.key, strings)
    }

    const [first] = strings

    routeQuery.set(this.key, first)
  }

  private safeParseValue(value: LocationQueryValue): T | InvalidRouteParamValue {
    try {
      return this.parse(value)
    } catch (error) {
      if (!isInvalidRouteParamValue(error)) {
        console.error(error)
      }

      return new InvalidRouteParamValue()
    }
  }

  private safeFormatValue(value: T): LocationQueryValue | InvalidRouteParamValue {
    try {
      return this.format(value)
    } catch (error) {
      if (!isInvalidRouteParamValue(error)) {
        console.error(error)
      }

      return new InvalidRouteParamValue()
    }
  }

}