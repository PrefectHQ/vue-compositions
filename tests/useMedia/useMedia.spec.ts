import { render } from '@testing-library/vue'
import { h, isRef, ref } from 'vue'
import { timeout } from '../utils'
import { useMedia } from '@/useMedia'

describe('media', () => {
  const addEventListener = jest.fn()
  const removeEventListener = jest.fn()

  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener,
        removeEventListener,
        dispatchEvent: jest.fn(),
      })),
    })
  })

  afterEach(() => jest.resetAllMocks())

  it('returns a ref', () => {
    const match = useMedia('(hover)')

    expect(isRef(match)).toBe(true)
  })

  it('if query changes, media is called again', async () => {
    const query = ref('(hover)')
    useMedia(query)

    query.value = '(touch)'
    await timeout()

    expect(window.matchMedia).toBeCalledTimes(2)
  })

  it('if query changes, event listener is updated', async () => {
    const query = ref('(hover)')
    useMedia(query)

    query.value = '(touch)'
    await timeout()

    expect(removeEventListener).toBeCalledTimes(1)
    expect(addEventListener).toBeCalledTimes(2)
  })


  it('if vue component is unmounted, event listener is removed', () => {
    const { unmount } = render({
      setup() {
        useMedia('(hover)')

        return () => h('p')
      },
    })

    unmount()

    expect(removeEventListener).toBeCalledTimes(1)
  })

})
