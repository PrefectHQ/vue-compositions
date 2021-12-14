import { clone } from '@/clone'
import { isReactive, isRef, reactive, ref, shallowReactive } from 'vue'
import { timeout } from '../utils'

describe('clone', () => {

    it('clones primitive sources', () => {
        const source = 0
        const copy = clone(source)

        expect(source === copy).toBe(true)
    })

    it('clones array sources', () => {
        const source = [0]
        const copy = clone(source)

        expect(JSON.stringify(source) === JSON.stringify(copy)).toBe(true)
    })

    it('clones object sources', () => {
        const source = { source: 0 }
        const copy = clone(source)

        expect(JSON.stringify(source) === JSON.stringify(copy)).toBe(true)
    })

    it('breaks array reference', () => {
        const source = [0]
        const copy = clone(source)

        expect(source == copy).toBe(false)
    })

    it('breaks object reference', () => {
        const source = { source: 0 }
        const copy = clone(source)

        expect(source === copy).toBe(false)
    })

    it('breaks reactive reference', async () => {
        const child = { hello: 'world' }
        const source = reactive({ child })
        const copy = clone(source)

        child.hello = 'bob'

        await timeout()

        expect(source.child === copy.child).toBe(false)
    })

    it('breaks ref reference', async () => {
        const child = ref({ hello: 'world'} )
        const source = reactive({ child })
        const copy = clone(source)

        child.value.hello = 'bob'

        await timeout()

        expect(source.child === copy.child).toBe(false)
    })

    it('retains prototype', () => {
        class MyClass {}

        const source = new MyClass()
        const copy = clone(source)

        expect(copy instanceof MyClass).toBe(true)
    })

    it('retains prototype recursively', () => {
        class MySubClass {}
        class MyParentClass {
            public myProperty = new MySubClass()
        }

        const source = new MyParentClass()
        const copy = clone(source)

        expect(copy.myProperty instanceof MySubClass).toBe(true)
    })

    it('retains reactive proxy', () => {
        const source = reactive({ hello: 'world '})
        const copy = clone(source)

        expect(isReactive(copy)).toBe(true)
    })

    it('does not retain shallowReactive proxy', () => {
        const source = shallowReactive({ hello: ref('world') })
        const copy = clone(source)

        expect(isRef(copy.hello)).toBe(false)
    })

    it('retains ref', () => {
        const source = ref(0)
        const copy = clone(source)

        expect(isRef(copy)).toBe(true)
    })

    it('updates response when source is a ref', async () => {
        const source = ref(0)
        const copy = clone(source)

        source.value = 1

        await timeout()

        expect(copy.value).toBe(1)
    })

    it('updates response when source is reactive', async () => {
        const source = reactive({ number: 0 })
        const copy = clone(source)

        source.number = 1

        await timeout()

        expect(copy.number).toBe(1)
    })
})