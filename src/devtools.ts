import {
  type App,
  setupDevtoolsPlugin
} from '@vue/devtools-api'
import * as useSubscriptionDevtools from './useSubscription/useSubscriptionDevtools'

export function setupDevtools(app: App): void {
  setupDevtoolsPlugin({
    id: 'prefect-vue-compositions-devtools',
    label: 'Prefect Devtools',
    packageName: '@prefecthq/vue-compositions',
    homepage: 'https://www.prefect.io/',
    settings: {
      ...useSubscriptionDevtools.SUBSCRIPTION_DEVTOOLS_SETTINGS,
    },
    app,
  }, (api) => {
    useSubscriptionDevtools.init(api)
  })
}