import { reactive, unref } from 'vue'
import Manager from '@/useSubscription/models/manager'
import { Action, ActionArguments } from '@/useSubscription/types/action'
import { SubscribeArguments, UseSubscription } from '@/useSubscription/types/subscription'
import { mapSubscription } from '@/useSubscription/utilities/subscriptions'
import { getValidWatchSource } from '@/utilities/getValidWatchSource'
import { tryOnScopeDispose } from '@/utilities/tryOnScopeDispose'
import { uniqueValueWatcher } from '@/utilities/uniqueValueWatcher'

export const defaultSubscriptionManager = new Manager()

/**
 * The `useSubscription` composition manages data sharing across components. Multiple components can subscribe to an `action` (any method or function) and share the response value.
 *
 * @see [docs](https://github.com/PrefectHQ/vue-compositions/tree/main/src/useSubscription#readme)
 *
 * @param action - The function to be executed.
 * @param args - Parameters of the action being executed.
 */
export function useSubscription<T extends Action>(
  ...[action, args, optionsArg = {}]: SubscribeArguments<T>
): UseSubscription<T> {
  const options = unref(optionsArg)
  const manager = options.manager ?? defaultSubscriptionManager
  const argsWithDefault = args ?? [] as unknown as ActionArguments<T>
  const originalSubscription = manager.subscribe(action, argsWithDefault, options)
  const subscriptionResponse = reactive(mapSubscription(originalSubscription))

  const unwatch = uniqueValueWatcher(getValidWatchSource(args), () => {
    // checking if args are null to support useSubscriptionWithDependencies
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!subscriptionResponse.isSubscribed() || unref(argsWithDefault) === null) {
      unwatch!()
      return
    }

    subscriptionResponse.unsubscribe()

    const newSubscription = manager.subscribe(action, argsWithDefault, options)

    newSubscription.response.value ??= subscriptionResponse.response
    newSubscription.executed.value = newSubscription.executed.value || subscriptionResponse.executed

    Object.assign(subscriptionResponse, mapSubscription(newSubscription))
  }, { deep: true })

  const unwatchOptions = uniqueValueWatcher(getValidWatchSource(optionsArg), () => {
    if (!subscriptionResponse.isSubscribed()) {
      unwatchOptions!()
      return
    }

    const options = unref(optionsArg)
    const manager = options.manager ?? defaultSubscriptionManager
    const newSubscription = manager.subscribe(action, argsWithDefault, options)
    subscriptionResponse.unsubscribe()

    Object.assign(subscriptionResponse, mapSubscription(newSubscription))
  }, { deep: true })

  tryOnScopeDispose(() => {
    const { lifecycle = 'component' } = unref(optionsArg)

    if (lifecycle === 'component') {
      subscriptionResponse.unsubscribe()
      unwatchOptions()
      unwatch()
    }
  })

  return subscriptionResponse
}
