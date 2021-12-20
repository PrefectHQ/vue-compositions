import { media } from '@/media'
import { isRef } from 'vue'

describe('media', () => {
    
    beforeAll(() => {
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: jest.fn(), // Deprecated
          removeListener: jest.fn(), // Deprecated
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        }))
      });
    });

    it('returns a ref', async () => {
        const match = media('(hover)')

        expect(isRef(match)).toBe(true)
    })

})
