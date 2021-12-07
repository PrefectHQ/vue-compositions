import { subscribe } from '@/subscribe'
import Manager from '@/subscribe/manager'
import { timeout, uniqueSubscribe } from '../utils'

function hello(number: number): boolean {
    return number === 1
}

function helloPromise(number: number, delay: number): Promise<boolean> {
    return new Promise(resolve => {
        setTimeout(() => resolve(hello(number)), delay)
    })
}

describe('subscribe', () => {

    it('returns the correct result', async () => {
        const subscription = uniqueSubscribe(hello, [1])

        await timeout()

        expect(subscription.result.value).toBe(true)
    })

    it('returns result undefined until action promise resolves', async () => {
        const subscription = uniqueSubscribe(helloPromise, [1, 10])

        await timeout(5)

        expect(subscription.result.value).toBe(undefined)
    })

    it('returns the correct result when action promise resolves', async () => {
        const subscription = uniqueSubscribe(helloPromise, [1, 10])

        await timeout(20)

        expect(subscription.result.value).toBe(true)
    })

    it('sets loading to true', async() => {
        const subscription = uniqueSubscribe(hello, [1])

        expect(subscription.loading.value).toBe(true)
    })

    it('sets loading to false', async() => {
        const subscription = uniqueSubscribe(hello, [1])
        
        await timeout()

        expect(subscription.loading.value).toBe(false)
    })

    it('defaults errored to false', async () => {
        function doesNotError() {
            return true
        }

        const subscription = uniqueSubscribe(doesNotError, [])

        expect(subscription.errored.value).toBe(false)
    })

    it('sets errored to true', async () => {
        function errors() {
            throw 'look! an error'
        }

        const subscription = uniqueSubscribe(errors, [])

        expect(subscription.errored.value).toBe(true)
    })

    it('sets error if an error is thrown', async () => {
        const error = 'look! an error'

        function errors() {
            throw error
        }

        const subscription = uniqueSubscribe(errors, [])

        expect(subscription.error.value).toBe(error)
    })

    it('doesn\'t execute multiple times when multiple subscriptions are created', () => {
        const manager = new Manager()
        let executions = 0

        function action() {
            return ++executions
        }

        subscribe(action, [], {}, manager)
        subscribe(action, [], {}, manager)

        expect(executions).toBe(1)
    })

    it('calculates the poll interval correctly', () => {
        const manager = new Manager()

        function action() {
            return true
        }

        const subscription1 = subscribe(action, [], { interval: 10 }, manager)
        const subscription2 = subscribe(action, [], { interval: 20 }, manager)
        const interval = subscription1.channel.interval

        subscription1.unsubscribe()
        subscription2.unsubscribe()

        expect(interval).toBe(10)
    })

    it('calculates the poll interval correctly when a subscription is unsubscribed', () => {
        const manager = new Manager()

        function action() {
            return true
        }

        const subscription1 = subscribe(action, [], { interval: 10 }, manager)
        const subscription2 = subscribe(action, [], { interval: 20 }, manager)

        subscription1.unsubscribe()

        const interval = subscription1.channel.interval

        subscription2.unsubscribe()
        
        expect(interval).toBe(20)
    })

    it('stops polling when all subscriptions with interval unsubscribe', () => {
        const manager = new Manager()

        function action() {
            return true
        }

        const subscription1 = subscribe(action, [], { interval: 10 }, manager)
        const subscription2 = subscribe(action, [], { interval: 20 }, manager)
        const subscription3 = subscribe(action, [], {}, manager)

        subscription1.unsubscribe()
        subscription2.unsubscribe()

        const interval = subscription1.channel.interval

        subscription3.unsubscribe()

        expect(interval).toBe(Infinity)
    })

    // this test is flakey.... can return different values sometimes because setTimeout isn't exact. 
    // is there a better way to test polling is working?
    it('executes the correct number of times when interval is set', async() => {
        const interval = 50
        const expectation = 5
        let executions = 0

        function action() {
            return ++executions
        }

        const subscription = uniqueSubscribe(action, [], { interval })

        await timeout(interval * expectation)
        await timeout(5) // buffer because setTimeout isn't precise to the ms

        subscription.unsubscribe()

        expect(executions).toBe(expectation)
    })

    it('stops executing when unsubscribed', async() => {
        const interval = 10
        let executions = 0

        function action() {
            return ++executions
        }

        const subscription = uniqueSubscribe(action, [], { interval })

        subscription.unsubscribe()

        await timeout(interval * 3)

        expect(executions).toBe(1)
    })

})