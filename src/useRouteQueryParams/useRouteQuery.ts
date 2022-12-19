import { computed, reactive, ref, Ref } from 'vue'
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
  set: (query: LocationQuery) => void,
  get: () => LocationQuery,
  clear: () => void,
  patch: (operation: QueryOperation) => LocationQuery,
  query: LocationQuery,
}

export function useRouteQuery(): UseRouteQuery {
  const route = useRoute()
  const router = useRouter()
  const queue = reactive<QueryOperation[]>([])

  const set = (query: LocationQuery): void => {
    router.push({ query })
  }

  const get = (): LocationQuery => route.query

  const clear = (): void => {
    router.push({ query: {} })
  }

  const patch = (operation: QueryOperation): LocationQuery => {
    queue.push(operation)

    return route.query
  }

  return {
    set,
    get,
    clear,
    patch,
    query: route.query,
  }
}

function doQueryOperations(currentQuery: LocationQuery, operations: QueryOperation[]): LocationQuery {
  const query = { ...currentQuery }

  operations.forEach(operation => {
    switch (operation.type) {
      case 'update':
        return updateQueryKey(query, operation)
      case 'delete':
        return deleteQueryKey(query, operation)
      default:
        throw new Error('Invalid query operation')
    }
  })

  return query
}

function updateQueryKey(currentQuery: LocationQuery, { key, value }: QueryUpdate): LocationQuery {
  const query = { ...currentQuery, [key]: value }

  return query
}

function deleteQueryKey(currentQuery: LocationQuery, { key }: QueryDelete): LocationQuery {
  // eslint-disable-next-line id-length, no-unused-vars
  const { [key]: _, ...queryWithKeyRemoved } = currentQuery

  return queryWithKeyRemoved
}