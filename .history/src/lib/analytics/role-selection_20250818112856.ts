// src/lib/analytics/role-selection.ts
// Advanced analytics with social proof tracking

import posthog from 'posthog-js';

if (typeof window !== 'undefined' && !posthog.__loaded) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || 'placeholder', {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.debug();
    }
  });
}

export const trackRolePageLoad = (userId: string, sessionId: string, socialProofDisplayed: any) => {
  posthog.capture('role_selection_page_load', {
    user_id: userId,
    session_id: sessionId,
    social_proof_displayed: socialProofDisplayed,
    timestamp: Date.now()
  });
};

export const trackSocialProofView = (role: string, count: number, message: string) => {
  posthog.capture('social_proof_displayed', {
    role,
    count,
    message,
    timestamp: Date.now()
  });
};

export const trackRoleHover = (role: string, duration: number, userId: string) => {
  posthog.capture('role_card_hover', {
    role,
    duration_ms: duration,
    user_id: userId,
    timestamp: Date.now()
  });
};

export const trackHelpSectionOpen = (section: string, userId: string) => {
  posthog.capture('role_help_opened', {
    section,
    user_id: userId,
    timestamp: Date.now()
  });
};

export const trackRoleSelection = (
  role: string, 
  selectionTime: number, 
  socialProofInfluence: boolean,
  userId: string
) => {
  posthog.capture('role_selected', {
    role,
    selection_time_ms: selectionTime,
    social_proof_influence: socialProofInfluence,
    user_id: userId,
    timestamp: Date.now()
  });
};

export const trackUserHesitation = (duration: number, userId: string) => {
  posthog.capture('user_hesitation_detected', {
    hesitation_duration_ms: duration,
    user_id: userId,
    timestamp: Date.now()
  });
};

export default posthog;