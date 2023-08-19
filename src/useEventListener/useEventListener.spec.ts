import { fireEvent, render } from '@testing-library/vue'
import { vi, describe, it, test, expect, afterEach } from 'vitest'
import { ref } from 'vue'
import { useEventListener } from '@/useEventListener/useEventListener'
import { timeout } from '@/utilities/tests'
import * as utils from '@/utilities/vue'

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
    vi.spyOn(utils, 'toValue').mockReturnValue(initialValue)

    useEventListener(target, 'click', callback)

    if (target.value) {
      const addEventListenerMock = vi.spyOn(target.value, 'addEventListener')
      expect(addEventListenerMock).not.toBeCalled()
    }

    expect(callback).not.toBeCalled()
  })

  it('adds event listener', () => {
    const target = ref<HTMLParagraphElement>()
    const element = document.createElement('p')
    vi.spyOn(utils, 'toValue').mockReturnValue(element)
    const addEventListenerMock = vi.spyOn(element, 'addEventListener')

    useEventListener(target, 'click', vi.fn())

    expect(addEventListenerMock).toHaveBeenCalledOnce()
  })

  it('given immediate false wont automatically add event listener', () => {
    const target = ref<HTMLParagraphElement>()
    const element = document.createElement('p')
    vi.spyOn(utils, 'toValue').mockReturnValue(element)
    const addEventListenerMock = vi.spyOn(element, 'addEventListener')

    useEventListener(target, 'click', vi.fn(), { immediate: false })

    expect(addEventListenerMock).not.toHaveBeenCalled()
  })

  it('add is called always adds listener', () => {
    const target = ref<HTMLParagraphElement>()
    const element = document.createElement('p')
    vi.spyOn(utils, 'toValue').mockReturnValue(element)
    const addEventListenerMock = vi.spyOn(element, 'addEventListener')

    const { add } = useEventListener(target, 'click', vi.fn(), { immediate: false })
    add()

    expect(addEventListenerMock).toHaveBeenCalledOnce()
  })

  it('remove is called always removes listener', () => {
    const target = ref<HTMLParagraphElement>()
    const element = document.createElement('p')
    vi.spyOn(utils, 'toValue').mockReturnValue(element)
    const addEventListenerMock = vi.spyOn(element, 'removeEventListener')

    const { remove } = useEventListener(target, 'click', vi.fn(), { immediate: false })
    remove()

    expect(addEventListenerMock).toHaveBeenCalledOnce()
  })

  it('triggers callback on event', () => {
    const callback = vi.fn()
    const target = ref<HTMLParagraphElement>()
    const element = document.createElement('p')
    vi.spyOn(utils, 'toValue').mockReturnValue(element)

    useEventListener(target, 'click', callback)

    fireEvent.click(element)

    expect(callback).toHaveBeenCalledOnce()
  })

  it('on scope dispose removes listener', () => {
    const target = ref<HTMLElement>()

    const { unmount } = render({
      setup: () => {
        useEventListener(target, 'click', vi.fn(), { immediate: false })
      },
    })

    const element = document.createElement('p')
    vi.spyOn(utils, 'toValue').mockReturnValue(element)
    const addEventListenerMock = vi.spyOn(element, 'removeEventListener')

    unmount()

    expect(addEventListenerMock).toHaveBeenCalled()
  })

  it('changing target automatically reattaches event listener', async () => {
    const target = ref<HTMLParagraphElement>()
    const originalElement = document.createElement('p')
    const updatedElement = document.createElement('div')

    const currentElement = ref(originalElement)
    vi.spyOn(utils, 'toValue').mockImplementation(() => currentElement.value)

    const originalAddEventListenerMock = vi.spyOn(originalElement, 'addEventListener')
    const originalRemoveEventListenerMock = vi.spyOn(originalElement, 'removeEventListener')
    const updatedAddEventListenerMock = vi.spyOn(updatedElement, 'addEventListener')

    useEventListener(target, 'click', vi.fn())

    currentElement.value = updatedElement

    // because reattaching would happen in watch
    await timeout()

    expect(originalAddEventListenerMock).toHaveBeenCalledOnce()
    expect(originalRemoveEventListenerMock).toHaveBeenCalledOnce()
    expect(updatedAddEventListenerMock).toHaveBeenCalledOnce()
  })

  it('changing target wont reattach if remove was called', async () => {
    const target = ref<HTMLParagraphElement>()
    const originalElement = document.createElement('p')
    const updatedElement = document.createElement('div')

    const currentElement = ref(originalElement)
    vi.spyOn(utils, 'toValue').mockImplementation(() => currentElement.value)

    const originalAddEventListenerMock = vi.spyOn(originalElement, 'addEventListener')
    const updatedAddEventListenerMock = vi.spyOn(updatedElement, 'addEventListener')

    const { remove } = useEventListener(target, 'click', vi.fn())

    remove()

    currentElement.value = updatedElement

    // because reattaching would happen in watch
    await timeout()

    expect(originalAddEventListenerMock).toHaveBeenCalledOnce()
    expect(updatedAddEventListenerMock).not.toHaveBeenCalled()
  })

})

