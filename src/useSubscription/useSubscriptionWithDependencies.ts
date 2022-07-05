import { Ref, watch } from 'vue'
import { Action, SubscriptionOptions, UseSubscription, ActionArguments } from './types'
import { useSubscription } from './useSubscription'

const voidAction = (): undefined => undefined

type UseSubscriptionWithDependencies<T extends Action> = [
  action: T,
  args: Ref<Parameters<T> | null>,
  options?: SubscriptionOptions
]

export function useSubscriptionWithDependencies<T extends Action>(...[action, args, options = {}]: UseSubscriptionWithDependencies<T>): UseSubscription<T | typeof voidAction> {
  const subscription = useSubscription(voidAction)

  watch(args, (value: Ref<Parameters<T> | null>, previousValue: Ref<Parameters<T> | null>) => {
    if (value === null && value !== previousValue) {
      if (subscription.isSubscribed()) {
        subscription.unsubscribe()
      }

      Object.assign(subscription, useSubscription(voidAction))

      return
    }

    const newSubscription = useSubscription(action, args as ActionArguments<T>, options)

    Object.assign(subscription, newSubscription)
  })

  return subscription
}