import { SubscriptionManager } from '@/useSubscription/models'
import { Action, ActionArguments } from '@/useSubscription/types/action'
import { defaultSubscriptionManager } from '@/useSubscription/useSubscription'

export function refreshChannel<T extends Action>(
  action: T,
  args: ActionArguments<T>,
  manager: SubscriptionManager = defaultSubscriptionManager,
): void {
  return manager.refresh(action, args)
}