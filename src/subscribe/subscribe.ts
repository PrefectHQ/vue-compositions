/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { onUnmounted, shallowReactive, ToRefs, toRefs, watch } from 'vue'
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

  // watch(
  //   args,
  //   (newArgs, oldArgs) => {
  //     console.log({ newArgs, oldArgs })
  //     subscription.unsubscribe()
  //     Object.assign(subscription, manager.subscribe(action, newArgs, options))
  //   },
  //   { deep: true }
  // )

  // onUnmounted(subscription.unsubscribe)

  return subscription
}
