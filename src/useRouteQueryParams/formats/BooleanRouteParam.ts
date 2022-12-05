import { RouteParam } from './RouteParam'

export class BooleanRouteParam extends RouteParam<boolean> {
  protected override default = false

  protected override parse(value: string): boolean {
    return value === 'true'
  }

  protected format(value: boolean): string {
    return value ? 'true' : 'false'
  }

}