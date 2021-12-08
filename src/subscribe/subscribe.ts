/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { getCurrentInstance, isRef, onUnmounted, shallowReactive, unref, watch } from 'vue'
import { Action, ActionArguments, SubscriptionOptions } from './types'
import Subscription from './subscription'
import Manager from './manager'

const defaultManager = new Manager()

export function subscribe<T extends Action>(
  action: T,
  args: ActionArguments<T>,
  options: SubscriptionOptions = {},
  manager: Manager = defaultManager
): Subscription<T> {
  const subscription = shallowReactive(manager.subscribe(action, args, options))
  let unwatch

  if(isRef(args) || (unref(args) as Parameters<T>).some(isRef)) {
    unwatch = watch(
      args,
      (newArgs) => {
        subscription.unsubscribe()
        Object.assign(subscription, manager.subscribe(action, newArgs, options))
      },
      { deep: true }
    )
  }

  if(getCurrentInstance()) {
    onUnmounted(() => {
      subscription.unsubscribe()

      if(unwatch) {
        unwatch()
      }
    })
  }

  return subscription
}
