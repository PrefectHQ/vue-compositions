import { getCurrentInstance, onUnmounted, reactive, unref, watch } from 'vue'
import Manager from './models/manager'
import { Action, ActionArguments } from './types/action'
import { SubscribeArguments, UseSubscription } from './types/subscription'
import { watchableArgs } from './utilities/reactivity'
import { mapSubscription } from './utilities/subscriptions'

const defaultManager = new Manager()

export function useSubscription<T extends Action>(...[action, args, options = {}]: SubscribeArguments<T>): UseSubscription<T> {
  const manager = options.manager ?? defaultManager
  const argsWithDefault = args ?? ([] as unknown as ActionArguments<T>)
  const originalSubscription = manager.subscribe(action, argsWithDefault, options)
  const subscriptionResponse = reactive(mapSubscription(originalSubscription))

  let unwatch: ReturnType<typeof watch> | undefined
  const watchable = watchableArgs(argsWithDefault)

  if (watchable !== null) {
    unwatch = watch(watchable, () => {
      // checking if args are null to support useSubscriptionWithDependencies
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!subscriptionResponse.isSubscribed() || unref(argsWithDefault) === null) {
        unwatch!()
        return
      }

      subscriptionResponse.unsubscribe()

      const newSubscription = manager.subscribe(action, argsWithDefault, options)

      newSubscription.response.value ??= subscriptionResponse.response
      newSubscription.executed.value = subscriptionResponse.executed || newSubscription.executed.value

      Object.assign(subscriptionResponse, mapSubscription(newSubscription))
    }, { deep: true })
  }

  if (getCurrentInstance()) {
    onUnmounted(() => {
      subscriptionResponse.unsubscribe()

      if (unwatch) {
        unwatch()
      }
    })
  }

  return subscriptionResponse
}
