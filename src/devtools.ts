import {
  type App,
  setupDevtoolsPlugin,
  type DevtoolsPluginApi,
  type CustomInspectorNode,
  type CustomInspectorState,
  type InspectorNodeTag
} from '@vue/devtools-api'
import { useSubscriptionDevtoolsInspector } from './useSubscription/devtools'
import { nextTick } from 'vue'

export function setupDevtools(app: App): void {
  setupDevtoolsPlugin({
    id: 'prefect-vue-compositions-devtools',
    label: 'Prefect Devtools',
    packageName: '@prefecthq/vue-compositions',
    homepage: 'https://www.prefect.io/',
    app,
  }, (api) => {
    // api.on.inspectComponent((payload, ctx) => {
    //   payload.instanceData.state.push({
    //     type: 'text',
    //     key: 'subscriptions',
    //     editable: false,
    //     value: ,
    //   })
    //   })
    setupSubscriptionsInspector(api)
    api.getComponentName
  })
}

let API: DevtoolsPluginApi<Record<string, unknown>> | null = null
const SUBSCRIPTIONS_INSPECTOR_ID = 'prefect-vue-compositions-subscriptions'

function setupSubscriptionsInspector(api: DevtoolsPluginApi<Record<string, unknown>>): void {
  API = api
  api.addInspector({
    id: SUBSCRIPTIONS_INSPECTOR_ID,
    label: 'Subscriptions',
    icon: 'storage',
    treeFilterPlaceholder: 'Search subscriptions',
  })

  api.on.getInspectorTree((payload, context) => {
    if (payload.inspectorId === SUBSCRIPTIONS_INSPECTOR_ID) {
      payload.rootNodes = []
      for (const { node } of useSubscriptionDevtoolsInspector.channelNodes.values()) {
        payload.rootNodes.push(node)
      }
    }
  })

  api.on.getInspectorState(async (payload, context) => {
    if (payload.inspectorId === SUBSCRIPTIONS_INSPECTOR_ID) {
      payload.state = useSubscriptionDevtoolsInspector.getCustomInspectorState(payload.nodeId)

      await Promise.all(payload.state["Subscribed Components"].map(async (subscription) => {
        if (!subscription.value) { return }
        const name = await api.getComponentName(subscription.value)
        subscription.value = name
      }))
    }
  })
}

function throttle(fn: Function, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return function (...args) {
    const next = () => fn.apply(this, args);
    clearTimeout(timeout);
    timeout = setTimeout(next, wait);
  };
}

export const refreshInspector = throttle(() => {
  setTimeout(async () => {
    await nextTick();
    API?.sendInspectorState(SUBSCRIPTIONS_INSPECTOR_ID);
    API?.sendInspectorTree(SUBSCRIPTIONS_INSPECTOR_ID);
  }, 100);
}, 100);

useSubscriptionDevtoolsInspector.refresh = refreshInspector
