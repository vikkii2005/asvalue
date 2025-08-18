// src/components/onboarding/role-switcher.tsx
// Future role switching with social proof

import React, { useState } from 'react';
import { UserRole, SocialProofData } from '@/lib/types/user';

interface RoleSwitcherProps {
  currentRole: UserRole;
  socialProofStats: SocialProofData;
  onRoleSwitch: (newRole: UserRole) => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
}

export default function RoleSwitcher({ 
  currentRole, 
  socialProofStats, 
  onRoleSwitch, 
  isOpen, 
  onClose 
}: RoleSwitcherProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  if (!isOpen) return null;

  const targetRole = currentRole === 'seller' ? 'buyer' : 'seller';
  const targetCount = targetRole === 'seller' ? socialProofStats.seller_count : socialProofStats.buyer_count;
  
  const handleSwitch = async () => {
    setIsLoading(true);
    try {
      await onRoleSwitch(targetRole);
      onClose();
    } catch (error) {
      console.error('Role switch failed:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Switch to {targetRole.charAt(0).toUpperCase() + targetRole.slice(1)} Role?
        </h3>
        
        <div className="mb-6">
          <div className="text-blue-600 font-medium mb-2">
            👥 Join {targetCount}+ active {targetRole}s
          </div>
          <div className="text-gray-600 text-sm">
            This will change your experience to {targetRole} mode with {targetRole === 'seller' ? 'product management' : 'marketplace browsing'}.
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleSwitch}
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Switching...' : 'Confirm Switch'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}