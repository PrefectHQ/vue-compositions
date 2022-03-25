import { getCurrentInstance, isReactive, isRef, onUnmounted, shallowReactive, unref, watch } from 'vue'
import Manager from './manager'
import Subscription from './subscription'
import { Action, ActionArguments, SubscribeArguments } from './types'
import { watchableArgs } from './utilities'

const defaultManager = new Manager()

export function useSubscription<T extends Action>(...[action, args, options = {}]: SubscribeArguments<T>): Subscription<T> {
  const manager = options.manager ?? defaultManager
  const argsWithDefault = args ?? ([] as unknown as ActionArguments<T>)
  const subscription = shallowReactive(manager.subscribe(action, argsWithDefault, options))

  let unwatch: ReturnType<typeof watch> | undefined

  if (
    isRef(args) ||
    isReactive(args) ||
    (unref(args) as Parameters<T>).some(isRef) ||
    (unref(args) as Parameters<T>).some(isReactive)
  ) {
    const argsToWatch = watchableArgs(argsWithDefault)

    unwatch = watch(
      argsToWatch,
      () => {
        if (!subscription.isSubscribed()) {
          unwatch!()
          return
        }

        subscription.unsubscribe()

        const newSubscription = manager.subscribe(action, argsWithDefault, options)

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
