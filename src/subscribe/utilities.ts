import { unref } from 'vue'
import { Action, ActionArguments } from './types'

export function unrefArgs<T extends Action>(args: ActionArguments<T>): Parameters<T> {
  const argsUnref = unref(args) as Parameters<T>

  return argsUnref.map(unref) as Parameters<T>
}