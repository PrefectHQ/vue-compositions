import { mount } from '@vue/test-utils'
import { vi, describe, it, test, expect, afterEach } from 'vitest'
import { ref } from 'vue'
import { useEventListener } from '@/useEventListener/useEventListener'
import { timeout } from '@/utilities/tests'

describe('useEventListener', () => {

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test.each<null | undefined>([
    undefined,
    null,
  ])('given falsy target never adds event listener', (initialValue) => {
    const callback = vi.fn()
    const target = ref<HTMLElement | undefined | null>(initialValue)

    useEventListener(target, 'click', callback)

    expect(callback).not.toBeCalled()
  })

  it('adds event listener', () => {
    const element = document.createElement('p')
    const target = ref<HTMLParagraphElement>(element)
    const addEventListenerMock = vi.spyOn(element, 'addEventListener')

    useEventListener(target, 'click', vi.fn())

    expect(addEventListenerMock).toHaveBeenCalledOnce()
  })

  it('given immediate false wont automatically add event listener', () => {
    const element = document.createElement('p')
    const target = ref<HTMLParagraphElement>(element)
    const addEventListenerMock = vi.spyOn(element, 'addEventListener')

    useEventListener(target, 'click', vi.fn(), { immediate: false })

    expect(addEventListenerMock).not.toHaveBeenCalled()
  })

  it('add is called always adds listener', () => {
    const element = document.createElement('p')
    const target = ref<HTMLParagraphElement>(element)
    const addEventListenerMock = vi.spyOn(element, 'addEventListener')

    const { add } = useEventListener(target, 'click', vi.fn(), { immediate: false })
    add()

    expect(addEventListenerMock).toHaveBeenCalledOnce()
  })

  it('remove is called always removes listener', () => {
    const element = document.createElement('p')
    const target = ref<HTMLParagraphElement>(element)
    const removeEventListenerMock = vi.spyOn(element, 'removeEventListener')

    const { remove } = useEventListener(target, 'click', vi.fn(), { immediate: false })
    remove()

    expect(removeEventListenerMock).toHaveBeenCalledOnce()
  })

  it('triggers callback on event', () => {
    const callback = vi.fn()
    const element = document.createElement('p')
    const target = ref<HTMLParagraphElement>(element)

    useEventListener(target, 'click', callback)

    element.dispatchEvent(new Event('click'))

    expect(callback).toHaveBeenCalledOnce()
  })

  it('on scope dispose removes listener', () => {
    const element = document.createElement('p')
    const target = ref<HTMLElement>(element)
    const addEventListenerMock = vi.spyOn(element, 'removeEventListener')

    const wrapper = mount({
      setup: () => {
        useEventListener(target, 'click', vi.fn(), { immediate: false })
      },
    })

    wrapper.unmount()

    expect(addEventListenerMock).toHaveBeenCalled()
  })

  it('changing target automatically reattaches event listener', async () => {
    const originalElement = document.createElement('p')
    const target = ref<HTMLParagraphElement>(originalElement)
    const updatedElement = document.createElement('p')

    const originalRemoveEventListenerMock = vi.spyOn(originalElement, 'removeEventListener')
    const updatedAddEventListenerMock = vi.spyOn(updatedElement, 'addEventListener')

    useEventListener(target, 'click', vi.fn())

    target.value = updatedElement

    // because reattaching would happen in watch
    await timeout()

    expect(originalRemoveEventListenerMock).toHaveBeenCalledOnce()
    expect(updatedAddEventListenerMock).toHaveBeenCalledOnce()
  })

  it('changing target wont reattach if remove was called', async () => {
    const originalElement = document.createElement('p')
    const target = ref<HTMLParagraphElement>(originalElement)
    const updatedElement = document.createElement('div')

    const originalAddEventListenerMock = vi.spyOn(originalElement, 'addEventListener')
    const updatedAddEventListenerMock = vi.spyOn(updatedElement, 'addEventListener')

    const { remove } = useEventListener(target, 'click', vi.fn())

    remove()

    target.value = updatedElement

    // because reattaching would happen in watch
    await timeout()

    expect(originalAddEventListenerMock).toHaveBeenCalledOnce()
    expect(updatedAddEventListenerMock).not.toHaveBeenCalled()
  })

  it('also functions with window as the target', () => {
    const callback = vi.fn()
    const addEventListenerMock = vi.spyOn(window, 'addEventListener')

    const { remove } = useEventListener(window, 'click', callback)

    window.dispatchEvent(new Event('click'))

    expect(callback).toHaveBeenCalledOnce()
    expect(addEventListenerMock).toHaveBeenCalledOnce()

    remove()

    window.dispatchEvent(new Event('click'))

    expect(callback).toHaveBeenCalledOnce()
  })

})

