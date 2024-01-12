import {
  type App,
  setupDevtoolsPlugin,
  type DevtoolsPluginApi} from '@vue/devtools-api'
import { useSubscriptionDevtoolsInspector } from './useSubscription/devtools'

export function setupDevtools(app: App): void {
  setupDevtoolsPlugin({
    id: 'prefect-vue-compositions-devtools',
    label: 'Prefect Devtools',
    packageName: '@prefecthq/vue-compositions',
    homepage: 'https://www.prefect.io/',
    app,
  }, (api) => {
    setupSubscriptionsInspector(api)
  })
}

function setupSubscriptionsInspector(api: DevtoolsPluginApi<Record<string, unknown>>): void {
  useSubscriptionDevtoolsInspector.setupDevtools(api)
}
