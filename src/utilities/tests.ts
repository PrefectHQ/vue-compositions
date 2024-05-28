import { computed, unref } from 'vue'
import { useSubscription } from '@/useSubscription'
import { SubscriptionManager } from '@/useSubscription/models/manager'
import { Action } from '@/useSubscription/types/action'
import { SubscribeArguments, UseSubscription } from '@/useSubscription/types/subscription'

export function timeout(ms = 0): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function uniqueSubscribe<T extends Action>(...[action, args, optionsArg = {}]: SubscribeArguments<T>): UseSubscription<T> {
  const options = computed(() => {
    const options = unref(optionsArg)

    return {
      ...options,
      manager: new SubscriptionManager(),
    }
  })

  return useSubscription(action, args!, options)
}