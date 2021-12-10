import { subscribe } from '@/subscribe'
import Manager from '@/subscribe/manager'
import { h, reactive, ref } from 'vue'
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

afterEach(() => jest.useRealTimers())

describe('subscribe', () => {

    it('returns the correct response', async () => {
        const subscription = await uniqueSubscribe(hello, [1])

        expect(subscription.response.value).toBe(true)
    })

    it('returns the correct response when awaiting the promise', async () => {
        jest.useFakeTimers()

        const promise = uniqueSubscribe(helloPromise, [1, 1000]).promise()

        jest.runAllTimers()

        const subscription = await promise

        expect(subscription.response.value).toBe(true)
    })

    it('returns response undefined until action promise resolves', () => {
        const subscription = uniqueSubscribe(helloPromise, [1, 10])

        expect(subscription.response.value).toBe(undefined)
    })

    it('returns the correct response when action promise resolves', async () => {
        jest.useFakeTimers()

        const subscription = uniqueSubscribe(helloPromise, [1, 10])

        jest.runAllTimers()
        jest.useRealTimers()

        await timeout()

        expect(subscription.response.value).toBe(true)
    })

    it('sets loading to true', () => {
        const subscription = uniqueSubscribe(hello, [1])

        expect(subscription.loading.value).toBe(true)
    })

    it('sets loading to false', async() => {
        const subscription = await uniqueSubscribe(hello, [1])

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

    it('rejects promise', async () => {
        const error = 'error'
        
        function action() {
            throw error
        }

        let caught

        try {
            await uniqueSubscribe(action, []).promise()
        } catch(err) {
            caught = err
        }

        expect(caught).toBe(error)
    })

    it('executes the action once when two subscriptions are created', () => {
        const manager = new Manager()
        const action = jest.fn()
        
        subscribe(action, [], {}, manager)
        subscribe(action, [], {}, manager)

        expect(action).toBeCalledTimes(1)
    })

    it('calculates the poll interval correctly', async () => {
        jest.useFakeTimers()
 
        const manager = new Manager()
        const action = jest.fn()
        const initialExecutions = 1
        const additionalExecutions = 3
        const minInterval = 10
        const maxInterval = 20

        subscribe(action, [], { interval: minInterval }, manager)
        subscribe(action, [], { interval: maxInterval }, manager)

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

        const subscription1 = subscribe(action, [], { interval: minInterval }, manager)
        const subscription2 = subscribe(action, [], { interval: maxInterval }, manager)

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

        const subscription1 = subscribe(action, [], { interval: minInterval }, manager)
        const subscription2 = subscribe(action, [], { interval: maxInterval }, manager)
        const subscription3 = subscribe(action, [], {}, manager)

        subscription1.unsubscribe()
        subscription2.unsubscribe()

        jest.advanceTimersByTime(maxInterval)

        expect(action).toBeCalledTimes(1)
    })

    it('executes the correct number of times when interval is set', () => {
        jest.useFakeTimers()

        const initialExecutions = 1
        const additionalExecutions = Math.floor( Math.random() * 10 ) + 1

        const action = jest.fn()
        
        uniqueSubscribe(action, [], { interval: 50 })

        for(let i = 0; i < additionalExecutions; i++) {
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

        it('when using args containing a reactive value', async () => {
            const action = jest.fn()
            const argument = reactive({ number: 0 })
            const args = [argument]
            
            uniqueSubscribe(action, args)
    
            argument.number = 1
    
            await timeout()
    
            expect(action).toBeCalledTimes(2)
        })

    })

    it('updates response when args change', async () => {
        const number = ref(0)
        const subscription = uniqueSubscribe(hello, [number])

        number.value = 1

        await timeout()

        expect(subscription.response.value).toBe(true)
    })

    it('calls unsubscribe when component is unmounted', () => {
        const action = jest.fn()
        let subscription

        const { unmount } = render({
            setup() {
                subscription = uniqueSubscribe(action, [])

                return () => h('p')
            }
        })

        const spy = jest.spyOn(subscription, 'unsubscribe')

        unmount()

        expect(spy).toBeCalledTimes(1)
    })

})