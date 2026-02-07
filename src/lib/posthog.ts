import posthog from "posthog-js";

export function initPostHog() {
  if (
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_POSTHOG_KEY
  ) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: true,
      capture_pageleave: true,
      loaded: (posthog) => {
        if (process.env.NODE_ENV === "development") posthog.debug();
      },
    });
  }
}

// Track custom events
export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.capture(event, properties);
  }
}

// Identify user
export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.identify(userId, properties);
  }
}

// Event constants
export const EVENTS = {
  SIGNUP_SUCCESS: "signup_success",
  LOGIN_SUCCESS: "login_success",
  GRADE_SELECTED: "grade_selected",
  SUBJECT_SELECTED: "subject_selected",
  BOARD_CREATED: "board_created",
  BOARD_RESET: "board_reset",
  CARD_MOVED: "card_moved",
  CARD_OPENED: "card_opened",
  CHECKLIST_TOGGLED: "checklist_toggled",
  START_TODAY_CLICKED: "start_today_clicked",
} as const;
