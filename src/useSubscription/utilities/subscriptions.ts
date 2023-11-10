import { reactive } from 'vue'
import Subscription from '@/useSubscription/models/subscription'
import { Action } from '@/useSubscription/types/action'
import { MappedSubscription, SubscriptionPromise } from '@/useSubscription/types/subscription'

export function mapSubscription<T extends Action>(subscription: Subscription<T>): MappedSubscription<T> {
  const { loading, error, errored, response, executed } = subscription

  return {
    loading,
    error,
    errored,
    response,
    executed,
    refresh: () => subscription.refresh(),
    unsubscribe: () => subscription.unsubscribe(),
    isSubscribed: () => subscription.isSubscribed(),
    promise: () => subscription.promise().then(subscription => mapSubscriptionPromise(subscription)),
  }
}

function mapSubscriptionPromise<T extends Action>(subscription: Subscription<T>): Awaited<SubscriptionPromise<T>> {
  const { loading, error, errored, response, executed } = subscription

  return reactive({
    loading,
    error,
    errored,
    response,
    executed,
    refresh: () => subscription.refresh(),
    unsubscribe: () => subscription.unsubscribe(),
    isSubscribed: () => subscription.isSubscribed(),
  }) as Awaited<SubscriptionPromise<T>>
}