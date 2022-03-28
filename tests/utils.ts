import { useSubscription } from '@/subscribe'
import Manager from '@/subscribe/manager'
import { Action, SubscribeArguments, UseSubscription } from '@/subscribe/types'

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