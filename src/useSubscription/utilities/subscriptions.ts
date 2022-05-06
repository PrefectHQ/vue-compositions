import { reactive } from 'vue'
import Subscription from '../models/subscription'
import { Action } from '../types/action'
import { MappedSubscription } from '../types/subscription'

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
    promise: () => subscription.promise().then(subscription => reactive(mapSubscription(subscription))),
  }
}