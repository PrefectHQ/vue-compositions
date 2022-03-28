import { isReactive, isRef, reactive, unref, WatchSource } from 'vue'
import Subscription from './subscription'
import { Action, ActionArguments, MappedSubscription } from './types'

export function unrefArgs<T extends Action>(args: ActionArguments<T>): Parameters<T> {
  const argsUnref = unref(args) as Parameters<T>

  return argsUnref.map(unref) as Parameters<T>
}

export function watchableArgs<T extends Action>(args: ActionArguments<T>): WatchSource | WatchSource[] | null {
  if (isRef(args) || isReactive(args)) {
    // can't quite figure out the types here. But the tests around reactive arguments pass so I believe this is correct
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return args as any
  }

  if (Array.isArray(args)) {
    return args.filter(arg => isRef(arg) || isReactive(arg))
  }

  return null
}

export function mapSubscription<T extends Action>(subscription: Subscription<T>): MappedSubscription<T> {
  const { loading, error, errored, response, executed } = subscription

  return {
    loading,
    error,
    errored,
    response,
    executed,
    refresh: () => subscription.refresh(),
    unsubscribe: () => subscription.unsubscribe(),
    isSubscribed: () => subscription.isSubscribed(),
    promise: () => subscription.promise().then(subscription => reactive(mapSubscription(subscription))),
  }
}