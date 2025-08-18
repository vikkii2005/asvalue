// src/lib/analytics/role-selection.ts
// DISABLED - For testing without PostHog API key

// Disabled PostHog for testing
const posthog = {
  capture: (event: string, properties?: any) => {
    console.log('📊 Analytics (disabled):', event, properties);
  },
  __loaded: true
};

export const trackRolePageLoad = (userId: string, sessionId: string, socialProofDisplayed: Record<string, unknown>) => {
  console.log('📊 Role page load:', { userId, sessionId, socialProofDisplayed });
};

export const trackSocialProofView = (role: string, count: number, message: string) => {
  console.log('📊 Social proof view:', { role, count, message });
};

export const trackRoleHover = (role: string, duration: number, userId: string) => {
  console.log('📊 Role hover:', { role, duration, userId });
};

export const trackHelpSectionOpen = (section: string, userId: string) => {
  console.log('📊 Help section open:', { section, userId });
};

export const trackRoleSelection = (
  role: string, 
  selectionTime: number, 
  socialProofInfluence: boolean,
  userId: string
) => {
  console.log('📊 Role selected:', { role, selectionTime, socialProofInfluence, userId });
};

export const trackUserHesitation = (duration: number, userId: string) => {
  console.log('📊 User hesitation:', { duration, userId });
};

export default posthog;