import { reactive, watch } from 'vue'
import { LocationQuery, LocationQueryValue, useRoute, useRouter } from 'vue-router'

type UseRouteQuery = {
  query: LocationQuery,
  clear: () => void,
  set: (key: string, value: string) => void,
  get: (key: string) => LocationQueryValue | LocationQueryValue[],
  remove: (key: string) => void,
}

type QueryOperation = (query: LocationQuery) => LocationQuery

export function useRouteQuery(): UseRouteQuery {
  const route = useRoute()
  const router = useRouter()
  const operations = reactive<QueryOperation[]>([])
  let interval: ReturnType<typeof setTimeout>

  const clear = (): void => {
    router.push({ query: {} })
  }

  const set = (key: string, value: string): void => {
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
  })

  const update = (): void => {
    const query = applyQueryOperations(route.query, operations)

    router.push({ query })
  }

  watch(operations, () => {
    clearInterval(interval)
    interval = setTimeout(update)
  })

  return {
    clear,
    set,
    get,
    remove,
    query,
  }
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