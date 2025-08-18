// src/components/onboarding/role-help.tsx
// FAQ and help section with authentic social proof context

import React, { useState } from 'react';
import { trackHelpSectionOpen } from '@/lib/analytics/role-selection';
import { SocialProofData } from '@/lib/types/user';

interface RoleHelpProps {
  socialProofStats: SocialProofData;
}

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function RoleHelp({ socialProofStats }: RoleHelpProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      trackHelpSectionOpen('role_help_opened', 'current-user');
    }
  };

  const handleFAQToggle = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
    trackHelpSectionOpen(`faq_${index}`, 'current-user');
  };

  const faqItems: FAQItem[] = [
    {
      question: "What's the difference between seller and buyer?",
      answer: `Sellers create and manage products, set prices, and handle customer interactions. Buyers browse and purchase products. ${socialProofStats.seller_count > 0 ? `Join our growing community of ${socialProofStats.seller_count}+ authentic sellers!` : 'Be among the first to start selling!'}`,
      category: "roles"
    },
    {
      question: "Can I be both a seller and buyer?",
      answer: "Yes! Many of our users switch between roles based on their needs. You can change your primary role anytime in your profile settings.",
      category: "flexibility"
    },
    {
      question: "Can I change my role later?",
      answer: "Absolutely! You can change roles in your profile settings anytime. Your data and preferences will be preserved.",
      category: "flexibility"
    },
    {
      question: "How do I know this platform is trustworthy?",
      answer: `We're completely transparent about our growth and policies. ${socialProofStats.days_live > 0 ? `We've been live for ${socialProofStats.days_live} days` : 'We just launched'} and maintain a zero commission policy forever. All seller counts you see are real and updated daily.`,
      category: "trust"
    },
    {
      question: "Are there any fees for sellers?",
      answer: "No! AsValue maintains a zero commission policy. Sellers keep 100% of their revenue. This is our permanent commitment to supporting entrepreneurs.",
      category: "fees"
    }
  ];

  if (!isOpen) {
    return (
      <div className="text-center mt-8">
        <button
          onClick={handleToggle}
          className="text-blue-600 hover:text-blue-700 underline text-sm font-medium"
          aria-expanded="false"
        >
          Need help choosing? 🤔
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Frequently Asked Questions
        </h3>
        <button
          onClick={handleToggle}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close help section"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        {faqItems.map((item, index) => (
          <div key={index} className="border-b border-gray-100 last:border-b-0">
            <button
              onClick={() => handleFAQToggle(index)}
              className="w-full text-left py-3 px-0 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              aria-expanded={openFAQ === index}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">
                  {item.question}
                </span>
                <span className="text-gray-500 ml-2">
                  {openFAQ === index ? '−' : '+'}
                </span>
              </div>
            </button>
            
            {openFAQ === index && (
              <div className="pb-3 text-gray-600">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="text-center">
          <h4 className="font-medium text-gray-900 mb-2">Quick Comparison</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded">
              <strong>🛒 Sellers</strong>
              <ul className="mt-2 space-y-1 text-gray-600">
                <li>• Create products</li>
                <li>• Set prices</li>
                <li>• Manage inventory</li>
                <li>• Keep 100% revenue</li>
              </ul>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <strong>🛍️ Buyers</strong>
              <ul className="mt-2 space-y-1 text-gray-600">
                <li>• Browse products</li>
                <li>• Make purchases</li>
                <li>• Leave reviews</li>
                <li>• Support sellers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}