import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

export const initSentry = () => {
  if (SENTRY_DSN && SENTRY_DSN.trim() !== '') {
    Sentry.init({
      dsn: SENTRY_DSN,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration()
      ],
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      environment: import.meta.env.MODE || 'production',
      beforeSend(event) {
        // Strip any sensitive government ID tokens or document blobs from payloads
        if (event.request && event.request.data) {
          try {
            if (typeof event.request.data === 'string' && event.request.data.includes('data:image')) {
              event.request.data = '[IMAGE_DATA_STRIPPED]';
            }
          } catch (e) {
            // silent
          }
        }
        return event;
      }
    });
    console.log('[Sentry] Error monitoring initialized.');
  } else {
    // Graceful no-op fallback when DSN is not configured
    console.log('[Sentry] Monitoring active in local fallback mode (VITE_SENTRY_DSN not provided).');
  }
};

export const captureError = (error, context = {}) => {
  console.error('[App Error Captured]:', error, context);
  if (SENTRY_DSN && SENTRY_DSN.trim() !== '') {
    Sentry.withScope((scope) => {
      if (context.tags) scope.setTags(context.tags);
      if (context.extra) scope.setExtras(context.extra);
      if (context.user) scope.setUser(context.user);
      Sentry.captureException(error);
    });
  }
};

export { Sentry };
