import { tryOnScopeDispose } from '@/utilities/tryOnScopeDispose'

type UseGlobalEventListener = {
  add: () => void,
  remove: () => void,
}

export function useGlobalEventListener<K extends keyof DocumentEventMap>(
  type: K,
  callback: (this: Document, event: DocumentEventMap[K]) => unknown,
  options?: boolean | AddEventListenerOptions,
): UseGlobalEventListener {

  const add = (): void => {
    document.addEventListener(type, callback, options)
  }

  const remove = (): void => {
    document.removeEventListener(type, callback, options)
  }

  add()
  tryOnScopeDispose(remove)

  return { add, remove }
}

