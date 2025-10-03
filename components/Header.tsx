


import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { GlobeIcon, CheckCircleIcon } from './Icons';
import Logo from './Logo';

const Header: React.FC = () => {
  const { isAuthenticated, logout, openLoginModal } = useAuth();
  const { t, changeLanguage, locale, supportedLanguages } = useLanguage();
  const [isLangMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const navLinksConfig = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.buy'), path: '/vendas' },
    { name: t('nav.rent'), path: '/alugueis' },
    { name: t('nav.seasonal'), path: '/temporada' },
    { name: t('nav.resources'), path: '/resources' },
    { name: t('nav.about'), path: '/about' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [langMenuRef]);

  const currentLanguage = supportedLanguages.find(lang => lang.code === locale);

  const LanguageSwitcher = () => (
    <div className="relative" ref={langMenuRef}>
      <button 
        onClick={() => setLangMenuOpen(!isLangMenuOpen)} 
        className="flex items-center text-slate-600 hover:text-primary-blue transition-colors p-2 rounded-full hover:bg-slate-100 space-x-1"
        aria-haspopup="true"
        aria-expanded={isLangMenuOpen}
        aria-label="Select language"
      >
        <GlobeIcon className="w-6 h-6" />
        {currentLanguage && (
          <span className="text-lg">{currentLanguage.flag}</span>
        )}
      </button>
      {isLangMenuOpen && (
        <div 
            className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5"
            role="menu"
            aria-orientation="vertical"
        >
          {supportedLanguages.map(lang => (
            <button 
              key={lang.code} 
              onClick={() => { changeLanguage(lang.code); setLangMenuOpen(false); }} 
              className={`w-full text-left flex items-center justify-between px-4 py-2 text-sm transition-colors ${locale === lang.code ? 'bg-primary-blue/10 text-primary-blue' : 'text-slate-700 hover:bg-slate-100'}`}
              role="menuitem"
            >
              <span className="flex items-center">
                <span className="mr-3 text-lg">{lang.flag}</span>
                {lang.name}
              </span>
              {locale === lang.code && <CheckCircleIcon className="w-5 h-5 text-primary-green" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 w-full border-b border-slate-200">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <Logo className="h-20 object-contain" />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinksConfig.map(link => (
              <Link key={link.name} to={link.path} className="text-slate-600 hover:text-primary-blue font-medium transition-colors">
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-4">
             <LanguageSwitcher />
             {isAuthenticated ? (
                <>
                    <Link
                        to="/admin/dashboard"
                        className="hidden md:inline-flex items-center px-4 py-2 bg-secondary-blue text-white font-semibold rounded-lg shadow-md hover:opacity-95 transition-all duration-200"
                    >
                        {t('nav.dashboard')}
                    </Link>
                    <button
                        onClick={logout}
                        className="hidden md:inline-flex px-4 py-2 bg-primary-green text-white font-semibold rounded-lg shadow-md hover:opacity-95 transition-all duration-200"
                    >
                        {t('nav.logout')}
                    </button>
                </>
            ) : (
                <button
                  onClick={openLoginModal}
                  className="hidden md:inline-flex px-4 py-2 bg-primary-green text-white font-semibold rounded-lg shadow-md hover:opacity-95 transition-all duration-200"
                >
                  {t('nav.login')}
                </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;