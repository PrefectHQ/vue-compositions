// eslint-disable-next-line max-classes-per-file
import { LocationQueryValue, LocationQuery } from 'vue-router'
import { InvalidRouteParamValue } from './InvalidRouteParamValue'
import { asArray } from '@/utilities/arrays'
import { isString } from '@/utilities/strings'

export type RouteParamClass<T> = new (key: string) => RouteParam<T>

export abstract class RouteParam<T> {
  // eslint-disable-next-line @typescript-eslint/ban-types
  protected abstract default: T & {}
  protected abstract parse(value: string): T
  protected abstract format(value: T): string

  private readonly key: string

  public constructor(key: string) {
    this.key = key
  }

  private parseValue(value: LocationQueryValue): T {
    try {
      if (value === null) {
        throw new InvalidRouteParamValue()
      }

      return this.parse(value)
    } catch (error) {
      if (!(error instanceof InvalidRouteParamValue)) {
        throw error
      }
    }

    return this.default
  }

  private formatValue(value: T): string {
    try {
      return this.format(value)
    } catch (error) {
      if (!(error instanceof InvalidRouteParamValue)) {
        throw error
      }
    }

    return this.format(this.default)
  }

  public getSingleValue(currentQuery: LocationQuery): T {
    const [value] = asArray(currentQuery[this.key])

    return this.parseValue(value)
  }

  public getArrayValue(currentQuery: LocationQuery): T[] {
    const values = asArray(currentQuery[this.key]).filter(isString)

    return values.map(value => this.parseValue(value))
  }

  public setSingleValue(currentQuery: LocationQuery, value: T): LocationQuery {
    if (value === this.default) {
      // eslint-disable-next-line id-length
      const { [this.key]: _, ...query } = currentQuery

      return query
    }

    const formatted = this.formatValue(value)

    return { ...currentQuery, [this.key]: formatted }
  }

  public setArrayValue(currentQuery: LocationQuery, values: T[]): LocationQuery {
    if (values.length === 0) {
      // eslint-disable-next-line id-length
      const { [this.key]: _, ...query } = currentQuery

      return query
    }

    const valuesFormatted = values.map(value => this.formatValue(value))

    return { ...currentQuery, [this.key]: valuesFormatted }
  }

}