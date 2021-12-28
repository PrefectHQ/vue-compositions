import { getCurrentInstance, isRef, onUnmounted, ref, Ref, unref, watch } from 'vue'

export function media(query: Ref<string> | string): Ref<boolean> {
  let mediaQuery = window.matchMedia(unref(query))
  const matches = ref(mediaQuery.matches)
  let unwatch

  function updateMatches(event: MediaQueryListEvent) {
    matches.value = event.matches
  }

  mediaQuery.addEventListener('change', updateMatches)

  if (isRef(query)) {
    unwatch = watch(query, () => {
      mediaQuery.removeEventListener('change', updateMatches)
      mediaQuery = window.matchMedia(unref(query))
      mediaQuery.addEventListener('change', updateMatches)
    })
  }

  if (getCurrentInstance()) {
    onUnmounted(() => {
      mediaQuery.removeEventListener('change', updateMatches)

      if (unwatch) {
        unwatch()
      }
    })
  }

  return matches
}
