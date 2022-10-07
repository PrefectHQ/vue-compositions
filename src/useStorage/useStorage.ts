/* eslint-disable no-redeclare */
import { ref, Ref, UnwrapRef, watchEffect } from 'vue'
import { StorageManager, StorageType } from './storage'

type UseStorage<T> = {
  value: Ref<UnwrapRef<T>>,
  initialValue: T,
  remove: () => void,
  set: (value: NonNullable<UnwrapRef<T>>) => void,
}

export function useStorage<T>(type: StorageType, key: string): UseStorage<T | null>
export function useStorage<T>(type: StorageType, key: string, defaultValue: T): UseStorage<T>
export function useStorage<T>(type: StorageType, key: string, defaultValue: T | null = null): UseStorage<T | null> {
  const storage = new StorageManager(type)
  const initialValue = storage.get(key, defaultValue)
  const data = ref(initialValue)

  const remove = (): void => {
    storage.remove(key)
    data.value = null
  }

  const set = (value: NonNullable<UnwrapRef<T>>): void => {
    data.value = value
  }

  watchEffect(() => {
    if (data.value !== null) {
      storage.set(key, data.value)
    }
  })

  return {
    value: data,
    initialValue,
    remove,
    set,
  }
}

export function useSessionStorage<T>(key: string): UseStorage<T | null>
export function useSessionStorage<T>(key: string, defaultValue: T): UseStorage<T>
export function useSessionStorage<T>(key: string, defaultValue: T | null = null): UseStorage<T | null> {
  return useStorage('session', key, defaultValue)
}

export function useLocalStorage<T>(key: string): UseStorage<T | null>
export function useLocalStorage<T>(key: string, defaultValue: T): UseStorage<T>
export function useLocalStorage<T>(key: string, defaultValue: T | null = null): UseStorage<T | null> {
  return useStorage('local', key, defaultValue)
}