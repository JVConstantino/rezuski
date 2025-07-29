import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { translations } from '../translations';
import { supabase } from '../lib/supabaseClient';
import { Category } from '../types';

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

interface DynamicData {
    categories: Category[];
    propertyTypes: { name: string; translations: any }[];
}

interface LanguageContextType {
    locale: Locale;
    t: (key: string) => string;
    changeLanguage: (newLocale: Locale) => void;
    supportedLanguages: Language[];
    categories: Category[];
    propertyTypes: { name: string; translations: any }[];
    loading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [locale, setLocale] = useState<Locale>('pt-BR');
    const [dynamicData, setDynamicData] = useState<DynamicData>({ categories: [], propertyTypes: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedLocale = localStorage.getItem('rezuski_locale') as Locale;
        if (storedLocale && supportedLanguages.some(l => l.code === storedLocale)) {
            setLocale(storedLocale);
        }
    }, []);

    useEffect(() => {
        const fetchDynamicData = async () => {
            setLoading(true);
            try {
                const [categoriesRes, propertyTypesRes] = await Promise.all([
                    supabase.from('categories').select('*'),
                    supabase.from('property_type_translations').select('*')
                ]);

                if (categoriesRes.error) throw categoriesRes.error;
                if (propertyTypesRes.error) throw propertyTypesRes.error;

                setDynamicData({
                    categories: categoriesRes.data || [],
                    propertyTypes: propertyTypesRes.data || [],
                });
            } catch (error) {
                console.error("Failed to fetch dynamic translation data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDynamicData();
    }, []);

    const changeLanguage = (newLocale: Locale) => {
        localStorage.setItem('rezuski_locale', newLocale);
        setLocale(newLocale);
    };

    const t = (key: string): string => {
        if (key.startsWith('category:')) {
            const id = key.split(':')[1];
            const category = dynamicData.categories.find(c => c.id === id);
            if (!category) return id;
            if (locale !== 'pt-BR' && category.translations?.[locale]) {
                return category.translations[locale] || category.name;
            }
            return category.name;
        }

        if (key.startsWith('propertyType:')) {
            const name = key.split(':')[1];
            const pType = dynamicData.propertyTypes.find(pt => pt.name === name);
            if (!pType) return name;
            if (locale !== 'pt-BR' && pType.translations?.[locale]) {
                return pType.translations[locale] || pType.name;
            }
            return pType.name;
        }

        return translations[locale][key] || key;
    };

    const value = {
        locale,
        t,
        changeLanguage,
        supportedLanguages,
        categories: dynamicData.categories,
        propertyTypes: dynamicData.propertyTypes,
        loading,
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