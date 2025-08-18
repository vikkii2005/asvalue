// src/lib/validations/role-accessibility.ts
// FIXED - ESLint compliant

import { UserRole, SocialProofData } from '@/lib/types/user';

interface ARIAProps {
  'aria-label': string;
  'aria-describedby': string;
  'role': string;
  'tabIndex': number;
}

export const generateARIALabels = (role: UserRole, socialProof: SocialProofData): ARIAProps => {
  const roleDescription = role === 'seller' ? 
    'Create and sell products' : 
    'Browse and buy products';
    
  const socialProofText = role === 'seller' && socialProof.seller_count > 0 ?
    `Join ${socialProof.seller_count} active sellers` :
    'Be among the first sellers';
  
  return {
    'aria-label': `Select ${role} role. ${roleDescription}. ${socialProofText}`,
    'aria-describedby': `${role}-benefits ${role}-social-proof`,
    'role': 'button',
    'tabIndex': 0
  };
};

export const announceSelection = (role: UserRole, socialProofContext: string): void => {
  const announcement = `${role.charAt(0).toUpperCase() + role.slice(1)} role selected. ${socialProofContext}. Redirecting to setup.`;
  
  if (typeof window !== 'undefined') {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = announcement;
    
    document.body.appendChild(announcer);
    
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  }
};

export const setupFocusManagement = (): void => {
  // Ensure focus is managed properly for keyboard users
  const focusableElements = document.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  focusableElements.forEach((_element, _index) => {
    _element.addEventListener('keydown', (e) => {
      const keyboardEvent = e as KeyboardEvent;
      if (keyboardEvent.key === 'Tab') {
        // Custom tab management if needed
      }
    });
  });
};

export const handleKeyboardNavigation = (event: KeyboardEvent): void => {
  if (event.key === 'Escape') {
    // Close any open modals or help sections
    const openModals = document.querySelectorAll('[data-modal="open"]');
    openModals.forEach(modal => {
      (modal as HTMLElement).click();
    });
  }
};