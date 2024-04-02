import { MaybeRefOrGetter, onScopeDispose, toValue } from 'vue'
import { useGlobalEventListener } from '@/useGlobalEventListener'

type ClickOutsideEntry = {
  element: MaybeRefOrGetter<Element>,
  callback: () => void,
}

const callbacks = new Map<symbol, ClickOutsideEntry>()

function handleClick(event: MouseEvent): void {
  for (const { element, callback } of callbacks.values()) {
    const elementValue = toValue(element)

    if (!elementValue.contains(event.target as Node)) {
      callback()
    }
  }
}

const { add, remove } = useGlobalEventListener('click', handleClick, { capture: true })

function tryTeardownEventListener(): void {
  if (callbacks.size > 0) {
    return
  }

  remove()
}

function tryAddEventListener(): void {
  if (callbacks.size > 0) {
    return
  }

  add()
}

export type UseClickOutsideCallbackFunction = () => void

export type UseClickOutside = {
  off: () => void,
  on: () => void,
}

export function useClickOutside(element: MaybeRefOrGetter<Element>, callback: UseClickOutsideCallbackFunction): UseClickOutside {
  const id = Symbol('useClickOutside')

  callbacks.set(id, { element, callback })

  tryAddEventListener()

  function off(): void {
    callbacks.delete(id)
    tryTeardownEventListener()
  }

  function on(): void {
    callbacks.set(id, { element, callback })
    tryAddEventListener()
  }

  onScopeDispose(() => {
    off()
    tryTeardownEventListener()
  })

  return {
    off,
    on,
  }
}