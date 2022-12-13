import { LocationQueryValue, LocationQuery } from 'vue-router'
import { InvalidRouteParamValue, isInvalidRouteParamValue, isNotInvalidRouteParamValue } from './InvalidRouteParamValue'
import { asArray } from '@/utilities/arrays'

export type RouteParamClass<T> = new (key: string) => RouteParam<T>

export abstract class RouteParam<T> {
  protected abstract parse(value: LocationQueryValue): T
  protected abstract format(value: T): LocationQueryValue

  private readonly key: string

  public constructor(key: string) {
    this.key = key
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

  public getSingleValue(currentQuery: LocationQuery): T | InvalidRouteParamValue {
    const [value] = asArray(currentQuery[this.key])

    return this.safeParseValue(value)
  }

  public getArrayValue(currentQuery: LocationQuery): T[] {
    const raw = asArray(currentQuery[this.key])
    const parsed = raw.map(value => this.safeParseValue(value))
    const valid = parsed.filter(isNotInvalidRouteParamValue)

    return valid
  }

  public setSingleValue(currentQuery: LocationQuery, value: T): LocationQuery {
    const formatted = this.safeFormatValue(value)

    if (isInvalidRouteParamValue(formatted)) {
      return this.removeKeyFromQuery(currentQuery, this.key)
    }

    return { ...currentQuery, [this.key]: formatted }
  }

  public setArrayValue(currentQuery: LocationQuery, values: T[]): LocationQuery {
    if (values.length === 0) {
      return this.removeKeyFromQuery(currentQuery, this.key)
    }

    const formatted = values.map(value => this.safeFormatValue(value))
    const valid = formatted.filter(isNotInvalidRouteParamValue)

    if (valid.length === 0) {
      return this.removeKeyFromQuery(currentQuery, this.key)
    }

    return { ...currentQuery, [this.key]: valid }
  }

  private removeKeyFromQuery(query: LocationQuery, key: string): LocationQuery {
    // eslint-disable-next-line id-length
    const { [key]: _, ...queryWithKeyRemoved } = query

    return queryWithKeyRemoved
  }

}