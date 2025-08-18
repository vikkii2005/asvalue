// src/components/onboarding/onboarding-progress.tsx
// Progress indicator showing onboarding steps

import React from 'react';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps?: number;
  stepNames?: string[];
}

export default function OnboardingProgress({ 
  currentStep, 
  totalSteps = 4, 
  stepNames = ['Role Selection', 'Profile Creation', 'Setup', 'Complete']
}: OnboardingProgressProps) {
  const progressPercentage = (currentStep / totalSteps) * 100;
  
  return (
    <div className="mb-8">
      <div className="text-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">
          Step {currentStep} of {totalSteps}: {stepNames[currentStep - 1]}
        </h2>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
          role="progressbar"
          aria-valuenow={currentStep}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-label={`Progress: Step ${currentStep} of ${totalSteps}`}
        />
      </div>
      
      {/* Step Indicators */}
      <div className="flex justify-between text-xs text-gray-500">
        {stepNames.map((name, index) => (
          <div 
            key={index}
            className={`flex flex-col items-center ${
              index + 1 <= currentStep ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${
              index + 1 <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}>
              {index + 1 <= currentStep ? '✓' : index + 1}
            </div>
            <span className="hidden sm:block">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}