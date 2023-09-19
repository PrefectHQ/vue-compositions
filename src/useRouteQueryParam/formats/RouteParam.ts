import { LocationQuery, LocationQueryValue } from 'vue-router'
import { InvalidRouteParamValue, isInvalidRouteParamValue, isNotInvalidRouteParamValue } from '@/useRouteQueryParam/formats/InvalidRouteParamValue'
import { asArray } from '@/utilities/arrays'

const IS_ROUTE_PARAM_SYMBOL: unique symbol = Symbol()

export type RouteParamClassArgs<T> = {
  key: string,
  defaultValue: T | T[],
  multiple: boolean,
}

// adding any here so RouteParamClass can be used without passing a generic
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RouteParamClass<T = any> = new (args: RouteParamClassArgs<T>) => RouteParam<T>

export function isRouteParamClass(value: unknown): value is RouteParamClass<unknown> {
  return typeof value === 'function' && IS_ROUTE_PARAM_SYMBOL in value
}

export function isRouteParamClassTuple(value: unknown): value is [RouteParamClass<unknown>] {
  const [first] = asArray(value)

  return typeof first === 'function' && IS_ROUTE_PARAM_SYMBOL in first
}

export abstract class RouteParam<T> {
  public static [IS_ROUTE_PARAM_SYMBOL] = true

  protected abstract parse(value: LocationQueryValue): T
  protected abstract format(value: T): LocationQueryValue

  protected key: string
  protected defaultValue: T | T[] | undefined
  protected multiple: boolean

  public constructor({ key, defaultValue, multiple }: RouteParamClassArgs<T>) {
    this.key = key
    this.defaultValue = defaultValue
    this.multiple = multiple || Array.isArray(defaultValue)
  }

  public get(query: LocationQuery): T | T[] | undefined {
    if (!(this.key in query)) {
      return this.defaultValue
    }

    const strings = asArray(query[this.key])
    const values = strings.map(value => this.safeParseValue(value)).filter(isNotInvalidRouteParamValue)

    if (this.multiple) {
      return values
    }

    const [first] = values

    return first
  }

  public set(query: LocationQuery, value: T | T[] | undefined): void {
    if (value === undefined) {
      delete query[this.key]
      return
    }

    const values = asArray(value)
    const strings = values.map(value => this.safeFormatValue(value)).filter(isNotInvalidRouteParamValue)

    if (strings.length === 0) {
      delete query[this.key]
      return
    }

    if (this.multiple) {
      query[this.key] = strings
      return
    }

    const [first] = strings

    query[this.key] = first
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