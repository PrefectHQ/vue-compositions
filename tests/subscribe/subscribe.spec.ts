import { subscribe } from '@/subscribe'
import Manager from '@/subscribe/manager'
import { h, ref } from 'vue'
import { timeout, uniqueSubscribe } from '../utils'
import { render } from '@testing-library/vue'

function hello(number: number): boolean {
    return number === 1
}

function helloPromise(number: number, delay: number): Promise<boolean> {
    return new Promise(resolve => {
        setTimeout(() => resolve(hello(number)), delay)
    })
}

describe('subscribe', () => {

    afterEach(() => jest.useRealTimers())

    it('returns the correct result', async () => {
        const subscription = uniqueSubscribe(hello, [1])

        await timeout()

        expect(subscription.result.value).toBe(true)
    })

    it('returns result undefined until action promise resolves', () => {
        const subscription = uniqueSubscribe(helloPromise, [1, 10])

        expect(subscription.result.value).toBe(undefined)
    })

    it('returns the correct result when action promise resolves', async () => {
        jest.useFakeTimers()

        const subscription = uniqueSubscribe(helloPromise, [1, 10])

        jest.runAllTimers()
        jest.useRealTimers()

        await timeout()

        expect(subscription.result.value).toBe(true)
    })

    it('sets loading to true', () => {
        const subscription = uniqueSubscribe(hello, [1])

        expect(subscription.loading.value).toBe(true)
    })

    it('sets loading to false', async() => {
        const subscription = uniqueSubscribe(hello, [1])
        
        await timeout()

        expect(subscription.loading.value).toBe(false)
    })

    it('defaults errored to false', () => {
        const action = jest.fn()

        const subscription = uniqueSubscribe(action, [])

        expect(subscription.errored.value).toBe(false)
    })

    it('sets errored to true', () => {
        function errors() {
            throw 'look! an error'
        }

        const subscription = uniqueSubscribe(errors, [])

        expect(subscription.errored.value).toBe(true)
    })

    it('sets error if an error is thrown', () => {
        const error = 'look! an error'

        function errors() {
            throw error
        }

        const subscription = uniqueSubscribe(errors, [])

        expect(subscription.error.value).toBe(error)
    })

    it('doesn\'t execute multiple times when multiple subscriptions are created', () => {
        const manager = new Manager()
        const action = jest.fn()

        subscribe(action, [], {}, manager)
        subscribe(action, [], {}, manager)

        expect(action).toBeCalledTimes(1)
    })

    it('calculates the poll interval correctly', () => {
        const manager = new Manager()
        const action = jest.fn()

        const subscription1 = subscribe(action, [], { interval: 10 }, manager)
        const subscription2 = subscribe(action, [], { interval: 20 }, manager)
        const interval = subscription1.channel.interval

        subscription1.unsubscribe()
        subscription2.unsubscribe()

        expect(interval).toBe(10)
    })

    it('calculates the poll interval correctly when a subscription is unsubscribed', () => {
        const manager = new Manager()
        const action = jest.fn()

        const subscription1 = subscribe(action, [], { interval: 10 }, manager)
        const subscription2 = subscribe(action, [], { interval: 20 }, manager)

        subscription1.unsubscribe()

        const interval = subscription1.channel.interval

        subscription2.unsubscribe()
        
        expect(interval).toBe(20)
    })

    it('stops polling when all subscriptions with interval unsubscribe', () => {
        const manager = new Manager()
        const action = jest.fn()

        const subscription1 = subscribe(action, [], { interval: 10 }, manager)
        const subscription2 = subscribe(action, [], { interval: 20 }, manager)
        const subscription3 = subscribe(action, [], {}, manager)

        subscription1.unsubscribe()
        subscription2.unsubscribe()

        const interval = subscription1.channel.interval

        subscription3.unsubscribe()

        expect(interval).toBe(Infinity)
    })

    it('executes the correct number of times when interval is set', () => {
        jest.useFakeTimers()

        const action = jest.fn()
        const subscription = uniqueSubscribe(action, [], { interval: 50 })

        // action is executed once immediately and sets a timer for the second run
        // runOnlyPendingTimers runs the timer and executes the action a second time
        jest.runOnlyPendingTimers()

        subscription.unsubscribe()

        expect(action).toBeCalledTimes(2)
    })

    it('stops executing when unsubscribed', () => {
        jest.useFakeTimers()

        const action = jest.fn()

        const subscription = uniqueSubscribe(action, [], { interval: 50 })
        subscription.unsubscribe()

        jest.runOnlyPendingTimers()

        expect(action).toBeCalledTimes(1)
    })

    it('calls action again when args change', async () => {
        const action = jest.fn()
        const number = ref(0)
        
        uniqueSubscribe(action, [number])

        number.value = 1

        await timeout()

        expect(action).toBeCalledTimes(2)
    })


    it('updates result when args change', async () => {
        function returnBackToMe(value: number): number {
            return value
        }

        const number = ref(0)
        const subscription = uniqueSubscribe(returnBackToMe, [number])

        number.value = 1

        await timeout()

        expect(subscription.result.value).toBe(1)
    })

    it('calls unsubscribe when component is unmounted', () => {
        const action = jest.fn()
        let subscription

        const { unmount } = render({
            setup() {
                subscription = uniqueSubscribe(action, [])

                return h('')
            }
        })

        const spy = jest.spyOn(subscription, 'unsubscribe')

        unmount()

        expect(spy).toBeCalledTimes(1)
    })

})