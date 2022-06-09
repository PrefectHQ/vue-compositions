import { render } from '@testing-library/vue'
import { computed, h, reactive, ref } from 'vue'
import { timeout, uniqueSubscribe } from '../utils'
import { useSubscription } from '@/useSubscription'
import Manager from '@/useSubscription/models/manager'
import { UseSubscription } from '@/useSubscription/types/subscription'

function numberEqualsOne(number: number): boolean {
  return number === 1
}

function numberEqualsOnePromise(number: number, delay: number): Promise<boolean> {
  return new Promise(resolve => {
    setTimeout(() => resolve(numberEqualsOne(number)), delay)
  })
}

afterEach(() => jest.useRealTimers())

describe('subscribe', () => {

  it('returns the correct response', async () => {
    const subscription = await uniqueSubscribe(numberEqualsOne, [1])

    expect(subscription.response).toBe(true)
  })

  it('returns the correct response when awaiting the promise', async () => {
    jest.useFakeTimers()

    const promise = uniqueSubscribe(numberEqualsOnePromise, [1, 1000]).promise()

    jest.runAllTimers()

    const subscription = await promise

    expect(subscription.response).toBe(true)
  })

  it('returns response undefined until action promise resolves', () => {
    const subscription = uniqueSubscribe(numberEqualsOnePromise, [1, 10])

    expect(subscription.response).toBe(undefined)
  })

  it('returns the correct response when action promise resolves', async () => {
    jest.useFakeTimers()

    const subscription = uniqueSubscribe(numberEqualsOnePromise, [1, 10])

    jest.runAllTimers()
    jest.useRealTimers()

    await timeout()

    expect(subscription.response).toBe(true)
  })

  it('sets loading to true', () => {
    const subscription = uniqueSubscribe(numberEqualsOne, [1])

    expect(subscription.loading).toBe(true)
  })

  it('sets loading to false', async () => {
    const subscription = await uniqueSubscribe(numberEqualsOne, [1])

    expect(subscription.loading).toBe(false)
  })

  it('defaults errored to false', () => {
    const action = jest.fn()

    const subscription = uniqueSubscribe(action, [])

    expect(subscription.errored).toBe(false)
  })

  it('sets errored to true', () => {
    function errors(): void {
      throw 'look! an error'
    }

    const subscription = uniqueSubscribe(errors, [])

    expect(subscription.errored).toBe(true)
  })

  it('sets error if an error is thrown', () => {
    const error = 'look! an error'

    function errors(): void {
      throw error
    }

    const subscription = uniqueSubscribe(errors, [])

    expect(subscription.error).toBe(error)
  })

  it('rejects promise', async () => {
    const error = 'error'

    function action(): void {
      throw error
    }

    let caught

    try {
      await uniqueSubscribe(action).promise()
    } catch (err) {
      caught = err
    }

    expect(caught).toBe(error)
  })

  it('executes the action once when two subscriptions are created', () => {
    const manager = new Manager()
    const action = jest.fn()

    useSubscription(action, [], { manager })
    useSubscription(action, [], { manager })

    expect(action).toBeCalledTimes(1)
  })

  it('calculates the poll interval correctly', () => {
    jest.useFakeTimers()

    const manager = new Manager()
    const action = jest.fn()
    const initialExecutions = 1
    const additionalExecutions = 3
    const minInterval = 10
    const maxInterval = 20

    useSubscription(action, [], { interval: minInterval, manager })
    useSubscription(action, [], { interval: maxInterval, manager })

    jest.advanceTimersByTime(additionalExecutions * minInterval)

    expect(action).toBeCalledTimes(initialExecutions + additionalExecutions)
  })

  it('calculates the poll interval correctly when a subscription is unsubscribed', () => {
    jest.useFakeTimers()

    const manager = new Manager()
    const action = jest.fn()
    const initialExecutions = 1
    const additionalExecutions = 3
    const minInterval = 10
    const maxInterval = 20

    const subscription1 = useSubscription(action, [], { interval: minInterval, manager })

    useSubscription(action, [], { interval: maxInterval, manager })

    subscription1.unsubscribe()

    jest.advanceTimersByTime(additionalExecutions * maxInterval)

    expect(action).toBeCalledTimes(initialExecutions + additionalExecutions)
  })

  it('stops polling when all subscriptions with interval unsubscribe', () => {
    jest.useFakeTimers()

    const manager = new Manager()
    const action = jest.fn()
    const minInterval = 10
    const maxInterval = 20

    const subscription1 = useSubscription(action, [], { interval: minInterval, manager })
    const subscription2 = useSubscription(action, [], { interval: maxInterval, manager })

    useSubscription(action, [], { manager })

    subscription1.unsubscribe()
    subscription2.unsubscribe()

    jest.advanceTimersByTime(maxInterval)

    expect(action).toBeCalledTimes(1)
  })

  it('executes the correct number of times when interval is set', () => {
    jest.useFakeTimers()

    const initialExecutions = 1
    const additionalExecutions = Math.floor(Math.random() * 10) + 1

    const action = jest.fn()

    uniqueSubscribe(action, [], { interval: 50 })

    for (let i = 0; i < additionalExecutions; i++) {
      jest.runOnlyPendingTimers()
    }

    expect(action).toBeCalledTimes(initialExecutions + additionalExecutions)
  })

  it('stops executing when unsubscribed', () => {
    jest.useFakeTimers()

    const action = jest.fn()

    const subscription = uniqueSubscribe(action, [], { interval: 50 })
    subscription.unsubscribe()

    jest.runOnlyPendingTimers()

    expect(action).toBeCalledTimes(1)
  })

  describe('executes action again when args change', () => {

    it('when using reactive args', async () => {
      const action = jest.fn()
      const args = reactive([0])

      uniqueSubscribe(action, args)

      args[0] = 1

      await timeout()

      expect(action).toBeCalledTimes(2)
    })

    it('when using ref args', async () => {
      const action = jest.fn()
      const args = ref([0])

      uniqueSubscribe(action, args)

      args.value = [1]

      await timeout()

      expect(action).toBeCalledTimes(2)
    })

    it('when using args containing a ref value', async () => {
      const action = jest.fn()
      const number = ref(0)
      const args = [number]

      uniqueSubscribe(action, args)

      number.value = 1

      await timeout()

      expect(action).toBeCalledTimes(2)
    })

    it('when using args containing a ref value and a non reactive value', async () => {
      const action = jest.fn()
      const number = ref(0)
      const args = [number, 0]

      uniqueSubscribe(action, args)

      number.value = 1

      await timeout()

      expect(action).toBeCalledTimes(2)
    })

    it('when using args containing a reactive value', async () => {
      const action = jest.fn()
      const argument = reactive({ number: 0 })
      const args = [argument]

      uniqueSubscribe(action, args)

      argument.number = 1

      await timeout()

      expect(action).toBeCalledTimes(2)
    })

    it('when using args containing a reactive value and a non reactive value', async () => {
      const action = jest.fn()
      const argument = reactive({ number: 0 })
      const args = [argument, 0]

      uniqueSubscribe(action, args)

      argument.number = 1

      await timeout()

      expect(action).toBeCalledTimes(2)
    })

  })

  it('updates response when args change', async () => {
    const number = ref(0)
    const subscription = uniqueSubscribe(numberEqualsOne, [number])
    number.value = 1

    await timeout()

    expect(subscription.response).toBe(true)
  })

  it('calls unsubscribe when component is unmounted', () => {
    const action = jest.fn()
    let subscription: UseSubscription<typeof action>

    const { unmount } = render({
      setup() {
        subscription = uniqueSubscribe(action, [])

        return () => h('p')
      },
    })

    const spy = jest.spyOn(subscription!, 'unsubscribe')

    unmount()

    expect(spy).toBeCalledTimes(1)
  })

  it('does not update subscription when unsubscribed', async () => {
    const manager = new Manager()
    let int = 0

    function action(): number {
      return ++int
    }

    const subscription1 = useSubscription(action, [], { manager })
    const subscription2 = useSubscription(action, [], { manager })

    await timeout()

    subscription1.unsubscribe()

    await subscription2.refresh()

    expect(subscription1.response).toBe(1)
    expect(subscription2.response).toBe(2)
  })

  it('does not update subscription when args change if unsubscribed', async () => {
    const number = ref(0)
    const subscription = uniqueSubscribe(numberEqualsOne, [number])

    await timeout()

    subscription.unsubscribe()

    number.value = 1

    await timeout()

    expect(subscription.response).toBe(false)
  })

  it('when using computed args', async () => {
    const action = jest.fn()
    const valueRef = ref(0)
    const valueComputed = computed(() => valueRef.value)

    uniqueSubscribe(action, [valueComputed])

    valueRef.value = 1

    await timeout()

    expect(action).toBeCalledTimes(2)
  })

  it('fails when using nested computed args', () => {
    const action = jest.fn()
    const valueRef = ref(0)
    const valueComputed = computed(() => valueRef)
    const valueComputedComputed = computed(() => valueComputed)

    expect(() => {
      uniqueSubscribe(action, [valueComputedComputed])
    }).toThrowError()

  })

  it('it does not return undefined when a subscription changes', async () => {
    jest.useFakeTimers()

    function action(value: number): Promise<number> {
      return new Promise((resolve) => setTimeout(() => resolve(value), 100))
    }

    const originalValue = 0
    const valueArg = ref(originalValue)
    const subscription = useSubscription(action, [valueArg])

    jest.runAllTimers()
    jest.useRealTimers()

    valueArg.value = 1

    await timeout()

    expect(subscription.response).toBe(originalValue)

    await timeout(110)

    expect(subscription.response).toBe(1)
  })

  it('it does retain previous subscription response when arguments change', async () => {
    jest.useFakeTimers()

    function action(value: number): Promise<number> {
      return new Promise((resolve) => setTimeout(() => resolve(value), 10))
    }

    const valueArg = ref(0)
    const subscription = useSubscription(action, [valueArg])

    jest.runAllTimers()
    jest.useRealTimers()

    while (valueArg.value < 2) {
      valueArg.value++

      // eslint-disable-next-line no-await-in-loop
      await timeout()

      expect(subscription.response).toBe(valueArg.value - 1)

      // eslint-disable-next-line no-await-in-loop
      await timeout(15)

      expect(subscription.response).toBe(valueArg.value)
    }

  })

  it('correctly sets response on additional subscriptions', async () => {
    function action(): number {
      return 0
    }

    const manager = new Manager()

    useSubscription(action, [], { manager })

    await timeout()

    const subscription = useSubscription(action, [], { manager })

    expect(subscription.response).toBe(0)
  })

  it('correctly sets executed', async () => {
    const action = jest.fn()
    const subscription = uniqueSubscribe(action)

    await timeout()

    expect(subscription.executed).toBe(true)
  })

  it('correctly sets executed on additional subscriptions', async () => {
    const action = jest.fn()
    const manager = new Manager()

    useSubscription(action, [], { manager })

    await timeout()

    const subscription = useSubscription(action, [], { manager })

    expect(subscription.executed).toBe(true)
  })

  it('stops executing when action errors', () => {
    const action = jest.fn(() => {
      throw 'error'
    })

    jest.useFakeTimers()

    uniqueSubscribe(action, [], { interval: 10000 })

    jest.advanceTimersByTime(10000 * 2)

    expect(action).toBeCalledTimes(1)
  })

})