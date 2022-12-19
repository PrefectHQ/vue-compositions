import { reactive, watch } from 'vue'
import { LocationQuery, useRoute, useRouter } from 'vue-router'

type UseRouteQuery = {
  query: LocationQuery,
  clear: () => void,
  set: (key: string, value: string) => void,
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

      operations.push(updateOperation(property, value))

      return true
    },
    deleteProperty(target, property) {
      if (typeof property === 'symbol') {
        return Reflect.deleteProperty(target, property)
      }

      operations.push(deleteOperation(property))

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

function updateOperation(key: string, value: string): QueryOperation {
  return (currentQuery: LocationQuery) => {
    const query = { ...currentQuery, [key]: value }

    return query
  }
}

function deleteOperation(key: string): QueryOperation {
  return (currentQuery: LocationQuery) => {
    const query = { ...currentQuery }

    delete query[key]

    return query
  }
}