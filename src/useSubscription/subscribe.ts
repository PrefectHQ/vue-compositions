import { getCurrentInstance, onUnmounted, reactive, watch } from 'vue'
import Manager from './manager'
import { Action, ActionArguments, SubscribeArguments, UseSubscription } from './types'
import { mapSubscription, watchableArgs } from './utilities'

const defaultManager = new Manager()

export function useSubscription<T extends Action>(...[action, args, options = {}]: SubscribeArguments<T>): UseSubscription<T> {
  const manager = options.manager ?? defaultManager
  const argsWithDefault = args ?? ([] as unknown as ActionArguments<T>)
  const subscription = manager.subscribe(action, argsWithDefault, options)
  const response = reactive(mapSubscription(subscription))

  let unwatch: ReturnType<typeof watch> | undefined
  const watchable = watchableArgs(argsWithDefault)

  if (watchable !== null) {
    unwatch = watch(
      watchable,
      () => {
        if (!response.isSubscribed()) {
          unwatch!()
          return
        }

        response.unsubscribe()

        const newSubscription = manager.subscribe(action, argsWithDefault, options)

        newSubscription.response.value ??= subscription.response.value

        Object.assign(response, mapSubscription(newSubscription))
      },
      { deep: true },
    )
  }

  if (getCurrentInstance()) {
    onUnmounted(() => {
      response.unsubscribe()

      if (unwatch) {
        unwatch()
      }
    })
  }

  return response
}
