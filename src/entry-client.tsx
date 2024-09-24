import * as Sentry from "@sentry/solidstart";
import { solidRouterBrowserTracingIntegration } from "@sentry/solidstart/solidrouter";
import { mount, StartClient } from "@solidjs/start/client";

Sentry.init({
  dsn: "https://ee0592df67ae51360f4dfe0ed8e1ed9b@o4507745204895744.ingest.us.sentry.io/4508000526925824",
  integrations: [
    solidRouterBrowserTracingIntegration(),
    Sentry.feedbackIntegration({
      showBranding: false,
      triggerLabel: "Give Feedback",
      formTitle: "Feedback/Bug Report",
      submitButtonLabel: "Submit Report",
      messagePlaceholder: "Do you have a suggestion or bug report? I would love to hear from you!",
    }),
  ],
  tracesSampleRate: 1.0,
});

mount(() => <StartClient />, document.getElementById("app")!);
