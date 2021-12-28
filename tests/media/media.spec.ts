import { render } from '@testing-library/vue'
import { h, isRef, ref } from 'vue'
import { timeout } from '../utils'
import { media } from '@/media'

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
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener,
        removeEventListener,
        dispatchEvent: jest.fn(),
      })),
    })
  })

  afterEach(() => jest.resetAllMocks())

  it('returns a ref', async () => {
    const match = media('(hover)')

    expect(isRef(match)).toBe(true)
  })

  it('if query changes, media is called again', async () => {
    const query = ref('(hover)')
    media(query)

    query.value = '(touch)'
    await timeout()

    expect(window.matchMedia).toBeCalledTimes(2)
  })

  it('if query changes, event listener is updated', async () => {
    const query = ref('(hover)')
    media(query)

    query.value = '(touch)'
    await timeout()

    expect(removeEventListener).toBeCalledTimes(1)
    expect(addEventListener).toBeCalledTimes(2)
  })


  it('if vue component is unmounted, event listener is removed', async () => {
    const { unmount } = render({
      setup() {
        media('(hover)')

        return () => h('p')
      },
    })

    unmount()

    expect(removeEventListener).toBeCalledTimes(1)
  })

})
