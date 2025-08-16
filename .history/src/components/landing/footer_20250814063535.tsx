import Link from 'next/link'
import { Zap } from 'lucide-react'
import { APP_CONFIG, SOCIAL_URLS } from '@/lib/constants'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="bg-blue-600 flex h-8 w-8 items-center justify-center rounded-lg">
                <Zap className="text-white h-5 w-5" />
              </div>
              <span className="text-white text-xl font-bold">
                {APP_CONFIG.name}
              </span>
            </Link>
            <p className="text-gray-400 max-w-md text-sm leading-relaxed mb-4">
              Transform your products into AI-powered sales machines. Create
              magic links, get instant QR codes, and let AI handle customer
              questions 24/7.
            </p>
            <div className="flex items-center text-blue-400 text-sm font-medium">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse" />
              🚀 Free Beta - Join the first 20 sellers
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#features"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#how-it-works"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  How it Works
                </Link>
              </li>
              <li>
                <span className="text-gray-500 text-sm">
                  Pricing (Coming Soon)
                </span>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href={`mailto:${APP_CONFIG.support_email}`}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Beta Support
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${APP_CONFIG.contact_email}`}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <span className="text-gray-500 text-sm">
                  Documentation (Coming Soon)
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="mt-8 pt-8 border-t border-gray-800 flex justify-center space-x-6">
          <a
            href={SOCIAL_URLS.twitter}
            className="text-gray-400 hover:text-white transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="sr-only">Twitter</span>
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a
            href={SOCIAL_URLS.instagram}
            className="text-gray-400 hover:text-white transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="sr-only">Instagram</span>
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                d="M12.017 0C8.396 0 7.929.013 7.794.052 2.281.263 0 2.62 0 12.017s.263 9.754 7.794 11.965c.135.039.602.052 4.223.052s4.088-.013 4.223-.052C23.737 21.771 24 19.414 24 12.017S21.771.263 16.24.052C16.105.013 15.638 0 12.017 0zm0 2.165c3.573 0 3.996.014 5.407.076 1.305.061 2.014.282 2.485.469.625.243 1.07.533 1.538 1.001s.758.913 1.001 1.538c.187.471.408 1.18.469 2.485.062 1.411.076 1.834.076 5.407s-.014 3.996-.076 5.407c-.061 1.305-.282 2.014-.469 2.485-.243.625-.533 1.07-1.001 1.538s-.913.758-1.538 1.001c-.471.187-1.18.408-2.485.469-1.411.062-1.834.076-5.407.076s-3.996-.014-5.407-.076c-1.305-.061-2.014-.282-2.485-.469-.625-.243-1.07-.533-1.538-1.001s-.758-.913-1.001-1.538c-.187-.471-.408-1.18-.469-2.485-.062-1.411-.076-1.834-.076-5.407s.014-3.996.076-5.407c.061-1.305.282-2.014.469-2.485.243-.625.533-1.07 1.001-1.538s.913-.758 1.538-1.001c.471-.187 1.18-.408 2.485-.469C8.021 2.179 8.444 2.165 12.017 2.165zm0 17.67c-3.259 0-5.915-2.656-5.915-5.915s2.656-5.915 5.915-5.915 5.915 2.656 5.915 5.915-2.656 5.915-5.915 5.915zm0-9.83c-2.16 0-3.915 1.755-3.915 3.915s1.755 3.915 3.915 3.915 3.915-1.755 3.915-3.915-1.755-3.915-3.915-3.915zm7.847-10.405c0 .76-.616 1.376-1.376 1.376s-1.376-.616-1.376-1.376.616-1.376 1.376-1.376 1.376.616 1.376 1.376z"
              />
            </svg>
          </a>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} {APP_CONFIG.name}. All rights reserved.
          </p>
          <p className="text-gray-500 mt-2 text-xs">
            Beta version - Help us build the future of AI-powered sales
          </p>
        </div>
      </div>
    </footer>
  )
}