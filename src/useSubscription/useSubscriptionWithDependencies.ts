import isEqual from 'lodash.isequal'
import { reactive, ref, Ref, toRaw, watch, MaybeRef } from 'vue'
import { Action, SubscriptionOptions, UseSubscription, ActionArguments, MappedSubscription } from '@/useSubscription/types'
import { useSubscription } from '@/useSubscription/useSubscription'

const voidAction = (): undefined => undefined

type UseSubscriptionWithDependencies<T extends Action> = [
  action: T,
  args: Ref<Parameters<T> | null>,
  options?: MaybeRef<SubscriptionOptions>
]

// returns a void subscription with executed overridden to be false
function rawVoidSubscription(): MappedSubscription<typeof voidAction> {
  const subscription = toRawSubscription(useSubscription(voidAction))
  subscription.executed = ref(false)

  return subscription
}

// toRaw doesn't get the original type so this utility correctly sets the type to a MappedSubscription
// which is the type useSubscription returns wrapped in reactive()
function toRawSubscription<T extends Action>(subscription: UseSubscription<T>): MappedSubscription<T> {
  return toRaw(subscription) as unknown as MappedSubscription<T>
}

/**
 * Similar to `useSubscription` but delays executing the action if args is null.
 *
 * This is useful for when you want to use a subscription but the arguments are not available yet (e.g. the result of a promise).
 * A common use case is for chaining subscriptions so that the second subscription is only executed after the first one is done.
 *
 * @see [`useSubscription`](https://github.com/PrefectHQ/vue-compositions/tree/main/src/useSubscription#readme) for more details.
 */
export function useSubscriptionWithDependencies<T extends Action>(...[action, args, options = {}]: UseSubscriptionWithDependencies<T>): UseSubscription<T | typeof voidAction> {
  const subscription = reactive(rawVoidSubscription())

  watch(args, (value: Parameters<T> | null, previousValue: Parameters<T> | null | undefined) => {
    if (value === null && previousValue === undefined) {
      return
    }

    if (isEqual(value, previousValue)) {
      return
    }

    if (subscription.isSubscribed()) {
      subscription.unsubscribe()
    }

    if (value === null) {
      Object.assign(subscription, rawVoidSubscription())

      return
    }

    const newSubscription = toRawSubscription(useSubscription(action, args as ActionArguments<T>, options))
    newSubscription.response.value ??= subscription.response
    newSubscription.executed.value = newSubscription.executed.value || subscription.executed

    Object.assign(subscription, newSubscription)

  }, { deep: true, immediate: true })

  return subscription
}