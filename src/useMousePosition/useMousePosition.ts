import { onScopeDispose, reactive, ref } from 'vue'
import { useGlobalEventListener } from '@/useGlobalEventListener'

export type MousePosition = {
  x: number,
  y: number,
}

export type UseMousePosition = {
  position: MousePosition,
  positionAtLastClick: MousePosition,
}

const position = reactive<MousePosition>({ x: 0, y: 0 })
const positionAtLastClick = reactive<MousePosition>({ x: 0, y: 0 })

const updatePositionAtLastClick = (): void => {
  Object.assign(positionAtLastClick, position)
}

const updateMousePosition = (event: MouseEvent): void => {
  position.x = event.clientX
  position.y = event.clientY

  if (positionAtLastClick.x === 0 && positionAtLastClick.y === 0) {
    updatePositionAtLastClick()
  }
}

const listeners = ref(0)

const { add: addMouseMoveEventListener, remove: removeMouseMoveEventListener } = useGlobalEventListener('mousemove', updateMousePosition, { passive: true })
const { add: addClickEventListener, remove: removeClickEventListener } = useGlobalEventListener('click', updatePositionAtLastClick, { capture: true })
const { add: addContextMenuEventListener, remove: removeContextMenuEventListener } = useGlobalEventListener('contextmenu', updatePositionAtLastClick, { capture: true })

function tryTeardownEventListeners(): void {
  if (listeners.value > 0) {
    return
  }

  removeMouseMoveEventListener()
  removeClickEventListener()
  removeContextMenuEventListener()
}

function addEventListeners(): void {
  // These have no effect if the event listeners are already added
  addMouseMoveEventListener()
  addClickEventListener()
  addContextMenuEventListener()
}

export function useMousePosition(): UseMousePosition {
  listeners.value += 1

  addEventListeners()

  onScopeDispose(() => {
    listeners.value -= 1
    tryTeardownEventListeners()
  })

  return {
    position,
    positionAtLastClick,
  }
}