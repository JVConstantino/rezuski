
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { translations } from '../translations';

type Locale = 'pt-BR' | 'en-US' | 'es-ES' | 'fr-FR' | 'it-IT';

type Language = {
    code: Locale;
    name: string;
    flag: string;
}

export const supportedLanguages: Language[] = [
    { code: 'pt-BR', name: 'Português', flag: '🇧🇷' },
    { code: 'en-US', name: 'English', flag: '🇺🇸' },
    { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
    { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
    { code: 'it-IT', name: 'Italiano', flag: '🇮🇹' },
];

interface LanguageContextType {
    locale: Locale;
    t: (key: string) => string;
    changeLanguage: (newLocale: Locale) => void;
    supportedLanguages: Language[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [locale, setLocale] = useState<Locale>('pt-BR');

    useEffect(() => {
        const storedLocale = localStorage.getItem('rezuski_locale') as Locale;
        if (storedLocale && supportedLanguages.some(l => l.code === storedLocale)) {
            setLocale(storedLocale);
        }
    }, []);

    const changeLanguage = (newLocale: Locale) => {
        localStorage.setItem('rezuski_locale', newLocale);
        setLocale(newLocale);
    };

    const t = (key: string): string => {
        return translations[locale][key] || key;
    };

    const value = {
        locale,
        t,
        changeLanguage,
        supportedLanguages
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
