import { expect, test, vi } from 'vitest'
import { SubscriptionManager } from '@/useSubscription/models/manager'

test('refresh only calls the action if an channel exists', async () => {
  const action = vi.fn()
  const manager = new SubscriptionManager()

  manager.refresh(action, [])

  expect(action).toBeCalledTimes(0)

  const subscription = await manager.subscribe(action, [], {}).promise()

  expect(action).toBeCalledTimes(1)

  manager.refresh(action, [])

  expect(action).toBeCalledTimes(2)

  subscription.unsubscribe()

  manager.refresh(action, [])

  expect(action).toBeCalledTimes(2)
})

test('refresh does not execute if maxRefreshRate has not been exceeded', async () => {
  vi.useFakeTimers()
  const action = vi.fn()
  const manager = new SubscriptionManager()
  const maxRefreshRate = 50

  await manager.subscribe(action, [], {}).promise()

  expect(action).toBeCalledTimes(1)

  manager.refresh(action, [], { maxRefreshRate })
  manager.refresh(action, [], { maxRefreshRate })
  manager.refresh(action, [], { maxRefreshRate })

  vi.advanceTimersByTime(maxRefreshRate)

  manager.refresh(action, [], { maxRefreshRate })

  expect(action).toBeCalledTimes(2)
})