import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface CookieConsentProps {
  className?: string;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    // Verificar se o usuário já aceitou os cookies
    const cookieConsent = localStorage.getItem('rezuski_cookie_consent');
    if (!cookieConsent) {
      // Mostrar o popup após um pequeno delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('rezuski_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('rezuski_cookie_consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  {t('cookies.title')}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {t('cookies.message')}
                  <a 
                    href="/privacy" 
                    className="text-blue-600 hover:text-blue-800 underline ml-1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('cookies.privacy_policy')}
                  </a>
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
            <button
              onClick={handleDecline}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200 border border-gray-300"
            >
              {t('cookies.decline')}
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200 shadow-sm"
            >
              {t('cookies.accept')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;