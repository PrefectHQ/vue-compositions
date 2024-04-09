export class InvalidRouteParamValue extends Error {

}

export function isInvalidRouteParamValue(value: unknown): value is InvalidRouteParamValue {
  return value instanceof InvalidRouteParamValue
}

export function isNotInvalidRouteParamValue<T>(value: T | InvalidRouteParamValue): value is T {
  return !isInvalidRouteParamValue(value)
}

export function isNotUndefined<T>(value: T | undefined): value is T {
  return value !== undefined
}