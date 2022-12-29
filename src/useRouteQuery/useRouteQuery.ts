import { reactive, watch } from 'vue'
import { LocationQuery, LocationQueryValue, RouteLocationNormalizedLoaded, Router, useRoute, useRouter } from 'vue-router'

export type UseRouteQuery = {
  query: LocationQuery,
  clear: () => void,
  set: (key: string, value: LocationQueryValue | LocationQueryValue[]) => void,
  get: (key: string) => LocationQueryValue | LocationQueryValue[],
  remove: (key: string) => void,
}

type QueryOperation = (query: LocationQuery) => LocationQuery

function factory(): () => UseRouteQuery {
  const operations = reactive<QueryOperation[]>([])
  let route: RouteLocationNormalizedLoaded
  let router: Router
  let interval: ReturnType<typeof setTimeout>

  const update = (): void => {
    const query = applyQueryOperations(route.query, operations)

    operations.splice(0)

    router.push({ query })
  }

  watch(operations, () => {
    if (!operations.length) {
      return
    }

    clearInterval(interval)
    interval = setTimeout(update)
  })

  const useRouteQuery = (): UseRouteQuery => {
    router = useRouter()
    route = useRoute()

    const clear = (): void => {
      router.push({ query: {} })
    }

    const set = (key: string, value: LocationQueryValue | LocationQueryValue[]): void => {
      query[key] = value
    }

    const get = (key: string): LocationQueryValue | LocationQueryValue[] => {
      return query[key]
    }

    const remove = (key: string): void => {
      delete query[key]
    }

    const query: LocationQuery = new Proxy({}, {
      get(target, property) {
        if (typeof property === 'symbol') {
          return Reflect.get(target, property)
        }

        const query = applyQueryOperations(route.query, operations)

        return query[property]
      },
      set(target, property, value) {
        if (typeof property === 'symbol' || typeof value !== 'string') {
          return Reflect.set(target, property, value)
        }

        const operation = updateOperationFactory(property, value)

        operations.push(operation)

        return true
      },
      deleteProperty(target, property) {
        if (typeof property === 'symbol') {
          return Reflect.deleteProperty(target, property)
        }

        const operation = deleteOperationFactory(property)

        operations.push(operation)

        return true
      },
      ownKeys() {
        const query = applyQueryOperations(route.query, operations)

        return Object.keys(query)
      },
      has(target, property) {
        return property in route.query
      },
    })

    return {
      clear,
      set,
      get,
      remove,
      query,
    }
  }

  return useRouteQuery
}

function applyQueryOperations(currentQuery: LocationQuery, operations: QueryOperation[]): LocationQuery {
  let query: LocationQuery = { ...currentQuery }

  for (const operation of operations) {
    query = operation(query)
  }

  return query
}

function updateOperationFactory(key: string, value: string): QueryOperation {
  return (currentQuery: LocationQuery) => {
    const query = { ...currentQuery, [key]: value }

    return query
  }
}

function deleteOperationFactory(key: string): QueryOperation {
  return (currentQuery: LocationQuery) => {
    const query = { ...currentQuery }

    delete query[key]

    return query
  }
}

export const useRouteQuery = factory()