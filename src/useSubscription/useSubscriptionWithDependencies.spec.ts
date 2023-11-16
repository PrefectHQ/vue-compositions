import { expect, test, vi } from 'vitest'
import { computed, ref } from 'vue'
import { useSubscriptionWithDependencies } from '@/useSubscription/useSubscriptionWithDependencies'
import { timeout } from '@/utilities/tests'

test('it does not execute the action when args have not changed', async () => {
  const object = ref({ value: 0 })
  const action = vi.fn()

  const parameters = computed(() => [object.value])

  useSubscriptionWithDependencies(action, parameters)

  await timeout()

  expect(action).toBeCalledTimes(1)

  object.value = { value: 1 }

  await timeout()

  expect(action).toBeCalledTimes(2)

  object.value = { value: 1 }

  await timeout()

  expect(action).toBeCalledTimes(2)
})