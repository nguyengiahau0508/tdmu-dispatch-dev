export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000',
  websocketUrl: 'ws://localhost:3000',
  googleAnalyticsKey: '',
  enableDebugTools: true,
  featureFlags: {
    enableNewUI: true,
    enableBetaFeatures: true,
  },
  sentryDsn: '', // disable Sentry in dev
};
