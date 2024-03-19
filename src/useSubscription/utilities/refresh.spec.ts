import { expect, test, vi } from 'vitest'
import { SubscriptionManager } from '@/useSubscription/models'
import { useSubscription } from '@/useSubscription/useSubscription'
import { refreshChannel } from '@/useSubscription/utilities/refresh'

test('channel refreshes only when channel is active', async () => {
  const action = vi.fn()
  const manager = new SubscriptionManager()
  const subscription = useSubscription(action, [], { manager })

  refreshChannel(action, [], { manager })

  subscription.unsubscribe()

  refreshChannel(action, [], { manager })

  expect(action).toBeCalledTimes(2)
})