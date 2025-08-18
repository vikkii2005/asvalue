// src/lib/analytics/role-selection.ts
// GOOGLE ANALYTICS 4 Implementation

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

// Initialize Google Analytics (call this in your layout.tsx)
export const initGA = (measurementId: string) => {
  if (typeof window !== 'undefined') {
    window.gtag = window.gtag || function() {
      (window.gtag as any).q = (window.gtag as any).q || [];
      (window.gtag as any).q.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', measurementId);
  }
};

// Track role selection page load
export const trackRolePageLoad = (userId: string, sessionId: string, socialProofDisplayed: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'role_selection_page_load', {
      custom_parameter_user_id: userId,
      custom_parameter_session_id: sessionId,
      custom_parameter_social_proof: JSON.stringify(socialProofDisplayed),
      event_category: 'User Journey',
      event_label: 'Role Selection Started'
    });
  }
  console.log('📊 GA4: Role page load tracked', { userId, sessionId });
};

// Track social proof view
export const trackSocialProofView = (role: string, count: number, message: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'social_proof_displayed', {
      custom_parameter_role: role,
      custom_parameter_count: count,
      custom_parameter_message: message,
      event_category: 'Social Proof',
      event_label: `${role} - ${count} users`
    });
  }
  console.log('📊 GA4: Social proof view tracked', { role, count, message });
};

// Track role hover
export const trackRoleHover = (role: string, duration: number, userId: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'role_card_hover', {
      custom_parameter_role: role,
      custom_parameter_duration: duration,
      custom_parameter_user_id: userId,
      event_category: 'User Interaction',
      event_label: `${role} card hovered`
    });
  }
  console.log('📊 GA4: Role hover tracked', { role, duration, userId });
};

// Track help section open
export const trackHelpSectionOpen = (section: string, userId: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'role_help_opened', {
      custom_parameter_section: section,
      custom_parameter_user_id: userId,
      event_category: 'Help System',
      event_label: `Help section: ${section}`
    });
  }
  console.log('📊 GA4: Help section tracked', { section, userId });
};

// Track role selection (MOST IMPORTANT for your 2L goal)
export const trackRoleSelection = (
  role: string, 
  selectionTime: number, 
  socialProofInfluence: boolean,
  userId: string
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    // Main conversion event
    window.gtag('event', 'role_selected', {
      custom_parameter_role: role,
      custom_parameter_selection_time: selectionTime,
      custom_parameter_social_proof_influence: socialProofInfluence,
      custom_parameter_user_id: userId,
      event_category: 'Conversion',
      event_label: `Role Selected: ${role}`,
      value: role === 'seller' ? 100 : 50 // Assign value (sellers more valuable)
    });

    // Track as conversion goal
    window.gtag('event', 'conversion', {
      send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL', // Add later when you set up Google Ads
      value: role === 'seller' ? 100 : 50,
      currency: 'INR'
    });
  }
  console.log('📊 GA4: Role selection tracked (CONVERSION)', { role, selectionTime, userId });
};

// Track user hesitation
export const trackUserHesitation = (duration: number, userId: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'user_hesitation_detected', {
      custom_parameter_duration: duration,
      custom_parameter_user_id: userId,
      event_category: 'User Behavior',
      event_label: 'Hesitation Detected'
    });
  }
  console.log('📊 GA4: User hesitation tracked', { duration, userId });
};

export default { initGA, trackRolePageLoad, trackSocialProofView, trackRoleHover, trackHelpSectionOpen, trackRoleSelection, trackUserHesitation };