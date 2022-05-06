import { useSubscription } from '@/useSubscription'
import Manager from '@/useSubscription/models/manager'
import { Action } from '@/useSubscription/types/action'
import { SubscribeArguments, UseSubscription } from '@/useSubscription/types/subscription'

export function timeout(ms = 0): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function uniqueSubscribe<T extends Action>(...[action, args, options = {}]: SubscribeArguments<T>): UseSubscription<T> {
  const optionsWithManager = {
    ...options,
    manager: new Manager(),
  }

  return useSubscription(action, args, optionsWithManager)
}