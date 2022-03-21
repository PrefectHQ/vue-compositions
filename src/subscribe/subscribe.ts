import { getCurrentInstance, isReactive, isRef, onUnmounted, shallowReactive, unref, watch } from 'vue'
import Manager from './manager'
import Subscription from './subscription'
import { Action, ActionArguments, SubscribeArguments, SubscriptionOptions } from './types'
import { watchableArgs } from './utilities'

const defaultManager = new Manager()

/**
 * @deprecated use useSubscription instead
 */
export function subscribe<T extends Action>(
  action: T,
  args: ActionArguments<T>,
  options: SubscriptionOptions = {},
): Subscription<T> {
  const manager = options.manager ?? defaultManager
  const subscription = shallowReactive(manager.subscribe(action, args, options))

  let unwatch: ReturnType<typeof watch> | undefined

  if (
    isRef(args) ||
    isReactive(args) ||
    (unref(args) as Parameters<T>).some(isRef) ||
    (unref(args) as Parameters<T>).some(isReactive)
  ) {
    const argsToWatch = watchableArgs(args)

    unwatch = watch(
      argsToWatch,
      () => {
        if (!subscription.isSubscribed()) {
          unwatch!()
          return
        }

        subscription.unsubscribe()

        const newSubscription = manager.subscribe(action, args, options)

        newSubscription.response.value ??= subscription.response.value

        Object.assign(subscription, newSubscription)
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

export function useSubscription<T extends Action>(...[action, args, options]: SubscribeArguments<T>): Subscription<T> {
  const argsWithDefault = args ?? ([] as unknown as ActionArguments<T>)
  const optionsWithDefault = options ?? {}

  return subscribe(action, argsWithDefault, optionsWithDefault)
}
