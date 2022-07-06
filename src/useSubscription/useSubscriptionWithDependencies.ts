import { reactive, Ref, toRaw, watch } from 'vue'
import { Action, SubscriptionOptions, UseSubscription, ActionArguments } from './types'
import { useSubscription } from './useSubscription'

const voidAction = (): undefined => undefined

type UseSubscriptionWithDependencies<T extends Action> = [
  action: T,
  args: Ref<Parameters<T> | null>,
  options?: SubscriptionOptions
]

export function useSubscriptionWithDependencies<T extends Action>(...[action, args, options = {}]: UseSubscriptionWithDependencies<T>): UseSubscription<T | typeof voidAction> {
  const subscription = reactive(toRaw(useSubscription(voidAction)))

  watch(args, (value: Parameters<T> | null, previousValue: Parameters<T> | null | undefined) => {
    if (value === null && previousValue === undefined) {
      return
    }

    if (value === null) {
      if (subscription.isSubscribed()) {
        subscription.unsubscribe()
      }

      Object.assign(subscription, toRaw(useSubscription(voidAction)))

      return
    }

    const newSubscription = toRaw(useSubscription(action, args as ActionArguments<T>, options))

    Object.assign(subscription, newSubscription)
  }, { immediate: true })

  return subscription
}