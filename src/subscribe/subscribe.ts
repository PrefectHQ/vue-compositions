import { getCurrentInstance, isReactive, isRef, onUnmounted, shallowReactive, unref, watch } from 'vue'
import Manager from './manager'
import Subscription from './subscription'
import { Action, ActionArguments, SubscribeArguments, SubscriptionOptions } from './types'

const defaultManager = new Manager()

/**
 * @deprecated use useSubscription instead
 */
// I don't think this method makes sense with 3 params
// eslint-disable-next-line max-params
export function subscribe<T extends Action>(
  action: T,
  args: ActionArguments<T>,
  options: SubscriptionOptions = {},
  manager: Manager = defaultManager,
): Subscription<T> {
  const subscription = shallowReactive(manager.subscribe(action, args, options))
  let unwatch: ReturnType<typeof watch> | undefined

  if (
    isRef(args) ||
    isReactive(args) ||
    (unref(args) as Parameters<T>).some(isRef) ||
    (unref(args) as Parameters<T>).some(isReactive)
  ) {
    unwatch = watch(
      args,
      (newArgs) => {
        if (!subscription.isSubscribed()) {
          unwatch!()
          return
        }

        subscription.unsubscribe()
        Object.assign(subscription, manager.subscribe(action, newArgs, options))
      },
      { deep: true },
    )
  }

  if (getCurrentInstance()) {
    onUnmounted(() => {
      subscription.unsubscribe()

      if (unwatch) {
        unwatch()
      }
    })
  }

  return subscription
}

export function useSubscription<T extends Action>(...[action, args, options, manager]: SubscribeArguments<T>): Subscription<T> {
  const argsWithDefault = args ?? ([] as unknown as ActionArguments<T>)
  const optionsWithDefault = options ?? {}
  const managerWithDefault = manager ?? defaultManager

  return subscribe(action, argsWithDefault, optionsWithDefault, managerWithDefault)
}
