import { reactive, unref } from 'vue'
import Manager from '@/useSubscription/models/manager'
import { Action, ActionArguments } from '@/useSubscription/types/action'
import { SubscribeArguments, UseSubscription } from '@/useSubscription/types/subscription'
import { mapSubscription } from '@/useSubscription/utilities/subscriptions'
import { getValidWatchSource } from '@/utilities/getValidWatchSource'
import { tryOnScopeDispose } from '@/utilities/tryOnScopeDispose'
import { uniqueValueWatcher } from '@/utilities/uniqueValueWatcher'

const defaultManager = new Manager()

/**
 * The `useSubscription` composition manages data sharing across components. Multiple components can subscribe to an `action` (any method or function) and share the response value.
 *
 * @example
 * ```typescript
 * import { useSubscription } from '@prefecthq/vue-compositions'
 *
 * const subscription = useSubscription(action, args, options)
 * ```
 *
 * ## How it works
 * When creating a subscription for the first time a `Channel` is created. A channel is unique to both the `action` and the `args` used to create the subscription. When a channel is created it immediately executes the action with the given args. If `options.interval` is set the action will execute again at that interval updating the `loading`, `errored`, `error`, and `response` values automatically.
 *
 * If another subscription is created with the same action and args, it will not execute the action again. Instead the same channel will be reused. So if multiple components subscribe using the same args the action will only be executed once.
 *
 * If any subscriptions have `options.interval` then the shortest interval will be used. All subscriptions will received an updated response at the decided interval, even if a specific subscription has no interval or if it has a greater interval. Interval is basically "maximum age of execution" which defaults to `Infinity`.
 *
 * When a subscription is removed the channel interval is recalculated. A subscription can be removed by calling `subscription.unsubscribe()` or the subscription will automatically be removed when the component that created the subscription is unmounted.
 *
 * @see [README](https://github.com/PrefectHQ/vue-compositions/tree/main/src/useSubscription#readme)
 *
 * @param action - The function to be executed.
 * @param args - Parameters of the action being executed.
 */
export function useSubscription<T extends Action>(
  ...[action, args, optionsArg = {}]: SubscribeArguments<T>
): UseSubscription<T> {
  const options = unref(optionsArg)
  const manager = options.manager ?? defaultManager
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
    const manager = options.manager ?? defaultManager
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
