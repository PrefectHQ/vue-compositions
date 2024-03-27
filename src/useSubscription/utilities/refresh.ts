import { SubscriptionManager } from '@/useSubscription/models/manager'
import { Action, ActionArguments } from '@/useSubscription/types/action'
import { RefreshChannelOptions } from '@/useSubscription/types/channels'
import { defaultSubscriptionManager } from '@/useSubscription/useSubscription'

export function refreshChannel<T extends Action>(
  action: T,
  args: ActionArguments<T>,
  options?: RefreshChannelOptions & { manager?: SubscriptionManager },
): void {
  const manager = options?.manager ?? defaultSubscriptionManager

  return manager.refresh(action, args, options)
}