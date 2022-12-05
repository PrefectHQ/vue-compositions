import { InvalidRouteParamValue } from './InvalidRouteParamValue'
import { RouteParam } from './RouteParam'

export class NumberRouteParam extends RouteParam<number> {
  protected default = 0

  protected parse(value: string): number {
    const parsed = parseInt(value)

    if (isNaN(parsed)) {
      throw new InvalidRouteParamValue()
    }

    return parsed
  }

  protected format(value: number): string {
    return `${value}`
  }
}
