import type { App } from 'vue'
import * as Sentry from '@sentry/vue'
import type { Pinia } from 'pinia'
import type { Router } from 'vue-router'

export function loadSentry(app: App, router?: Router, pinia?: Pinia) {
  const integrations = []

  if (router) integrations.push(Sentry.browserTracingIntegration({ router }))

  integrations.push(Sentry.replayIntegration())

  Sentry.init({
    app,
    dsn: 'https://9cb613ddb455c718938099269669cf3a@o4510793859137536.ingest.us.sentry.io/4510793926901760',
    // Adds request headers and IP for users, for more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/vue/configuration/options/#sendDefaultPii
    sendDefaultPii: true,
    // integrations: [Sentry.browserTracingIntegration({ router }), Sentry.replayIntegration()],
    integrations,
    // Enable logs to be sent to Sentry
    enableLogs: true,
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for tracing.
    // We recommend adjusting this value in production
    // Learn more at
    // https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
    tracesSampleRate: 1.0,
    // Set `tracePropagationTargets` to control for which URLs trace propagation should be enabled
    tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],
    // Capture Replay for 10% of all sessions,
    // plus for 100% of sessions with an error
    // Learn more at
    // https://docs.sentry.io/platforms/javascript/session-replay/configuration/#general-integration-configuration
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  })

  if (pinia) pinia.use(Sentry.createSentryPiniaPlugin())
}
