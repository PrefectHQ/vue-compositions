import { debounce } from 'lodash'
import { reactive, watch } from 'vue'
import { LocationQuery, useRoute, useRouter } from 'vue-router'

type QueryUpdate = {
  type: 'update',
  key: string,
  value: string,
}

type QueryDelete = {
  type: 'delete',
  key: string,
}

type QueryOperation = QueryUpdate | QueryDelete

type UseRouteQuery = {
  query: LocationQuery,
  clear: () => void,
  set: (key: string, value: string) => void,
  remove: (key: string) => void,
}

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

      operations.push({ type: 'update', key: property, value })

      return true
    },
    deleteProperty(target, property) {
      if (typeof property === 'symbol') {
        return Reflect.deleteProperty(target, property)
      }

      operations.push({ type: 'delete', key: property })

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
  let query = { ...currentQuery }

  operations.forEach(operation => {
    switch (operation.type) {
      case 'update':
        query = updateQueryParam(query, operation)
        break
      case 'delete':
        query = deleteQueryParam(query, operation)
        break
      default:
        throw new Error('Invalid query operation')
    }
  })

  return query
}

function updateQueryParam(currentQuery: LocationQuery, { key, value }: QueryUpdate): LocationQuery {
  const query = { ...currentQuery, [key]: value }

  return query
}

function deleteQueryParam(currentQuery: LocationQuery, { key }: QueryDelete): LocationQuery {
  const query = { ...currentQuery }

  delete query[key]

  return query
}