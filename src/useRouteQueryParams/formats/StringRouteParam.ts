import { RouteParam } from './RouteParam'

export class StringRouteParam extends RouteParam<string> {
  protected default = ''

  protected parse(value: string): string {
    return value
  }

  protected format(value: string): string {
    return value
  }
}