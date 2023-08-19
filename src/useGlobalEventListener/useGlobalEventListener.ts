import { useEventListener } from '@/useEventListener'

type UseGlobalEventListener = {
  add: () => void,
  remove: () => void,
}

/**
 * `useGlobalEventListener` is a composition for managing global event listeners on the Document object.
 * It returns `add` and `remove` methods for manually adding and removing the associated event listener.
 *
 * @param {K} type - The type of the event. This is a key of DocumentEventMap.
 * @param {function} callback - The callback function to be executed when the event is triggered.
 *                              The context of this function is the Document object and it receives an event of type K.
 * @param {boolean | AddEventListenerOptions} [options] - Optional parameter. An options object that specifies
 *                                                        characteristics about the event listener.
 *                                                        If this parameter is a boolean, it indicates whether the
 *                                                        event should be executed in the capturing or in the bubbling phase.
 *
 * @returns {UseGlobalEventListener} - An object with two methods: `add` and `remove`.
 *                                     `add` adds the event listener to the document and `remove` removes it.
 *                                     The event listener is automatically added upon creation and removed when the scope is disposed.
 *
 * @example
 * function handleEvent(event: Event) {
 * // Respond to event
 * }
 * const { remove } = useGlobalEventListener('click', handleEvent)
 * remove() // remove the listener manually
 */
export function useGlobalEventListener<K extends keyof DocumentEventMap>(
  type: K,
  callback: (this: Document, event: DocumentEventMap[K]) => unknown,
  options?: AddEventListenerOptions,
): UseGlobalEventListener {
  return useEventListener(document, type, callback, options)
}

