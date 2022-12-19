import { LocationQueryValue, LocationQuery } from 'vue-router'
import { InvalidRouteParamValue, isInvalidRouteParamValue, isNotInvalidRouteParamValue } from '@/useRouteQueryParams/formats/InvalidRouteParamValue'
import { asArray } from '@/utilities/arrays'

export type RouteParamClass<T> = new (key: string, defaultValue: T | T[]) => RouteParam<T>

export function isRouteParamClass(value: unknown): value is RouteParamClass<unknown> {
  return value instanceof RouteParam
}

export abstract class RouteParam<T> {
  protected abstract parse(value: LocationQueryValue): T
  protected abstract format(value: T): LocationQueryValue

  protected key: string
  protected defaultValue: T | T[]

  private get multiple(): boolean {
    return Array.isArray(this.defaultValue)
  }

  public constructor(key: string, defaultValue: T | T[]) {
    this.key = key
    this.defaultValue = defaultValue
  }

  public get(currentQuery: LocationQuery): T | T[] {
    if (!(this.key in currentQuery)) {
      return this.defaultValue
    }

    const strings = asArray(currentQuery[this.key])
    const values = strings.map(value => this.safeParseValue(value)).filter(isNotInvalidRouteParamValue)

    if (this.multiple) {
      return values
    }

    const [first] = values

    return first
  }

  public set(currentQuery: LocationQuery, value: T | T[]): LocationQuery {
    const values = asArray(value)
    const strings = values.map(value => this.safeFormatValue(value)).filter(isNotInvalidRouteParamValue)

    if (this.multiple) {
      this.defaultValue = []
    }

    if (strings.length === 0) {
      return this.remove(currentQuery)
    }

    if (this.multiple) {
      return { ...currentQuery, [this.key]: strings }
    }

    const [first] = strings

    return { ...currentQuery, [this.key]: first }
  }

  private remove(currentQuery: LocationQuery): LocationQuery {
    // eslint-disable-next-line id-length, no-unused-vars
    const { [this.key]: _, ...queryWithKeyRemoved } = currentQuery

    return queryWithKeyRemoved
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