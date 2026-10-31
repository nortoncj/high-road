import posthog from "posthog-js";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (!posthogKey) {
  if (process.env.NODE_ENV === "development") {
    throw new Error(
      "NEXT_PUBLIC_POSTHOG_KEY variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_KEY is configured",
    );
  }
} else if (!posthogHost) {
  if (process.env.NODE_ENV === "development") {
    throw new Error(
      "NEXT_PUBLIC_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_HOST is configured",
    );
  }
} else {
  posthog.init(posthogKey, {
    api_host: posthogHost,
    defaults: "2025-11-30",
    capture_exceptions: true,
    debug: process.env.NODE_ENV === "development",
    // The project has no surveys, so don't download surveys.js on every page.
    disable_surveys: true,
    // Replay starts on the first interaction (below) so the recorder and its full DOM snapshot
    // stay out of page load. Remote sampling and trigger settings still apply when it starts.
    disable_session_recording: true,
  });

  const events = ["pointerdown", "keydown", "touchstart", "scroll", "mousemove"] as const;
  const startRecording = () => {
    events.forEach((e) => window.removeEventListener(e, startRecording, true));
    posthog.startSessionRecording();
  };
  events.forEach((e) => window.addEventListener(e, startRecording, { passive: true, capture: true }));
}
