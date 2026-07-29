import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ManagedPropertyType } from '../types';
import { AIConfig } from './AIConfigContext';
import { supportedLanguages, useLanguage } from './LanguageContext';
import { GoogleGenAI } from "@google/genai";
import OpenAI from 'openai';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface PropertyTypeContextType {
    propertyTypes: ManagedPropertyType[];
    addPropertyType: (name: string) => Promise<void>;
    updatePropertyType: (id: string, name: string) => Promise<void>;
    deletePropertyType: (propertyTypeId: string) => Promise<void>;
    translateAllPropertyTypesWithAI: (aiConfig: AIConfig) => Promise<void>;
    loading: boolean;
}

interface CacheData {
    data: ManagedPropertyType[];
    timestamp: number;
}

const PropertyTypeContext = createContext<PropertyTypeContextType | undefined>(undefined);
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes in milliseconds

// Helper to clean potential markdown and extra text from AI JSON responses
const cleanAIResponse = (response: string): string => {
    // Remove markdown code blocks first
    let cleaned = response.replace(/```json\n?|\n?```/g, '').trim();

    // Find the start and end of the main JSON object or array
    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');

    let startIndex = -1;

    if (firstBrace === -1 && firstBracket === -1) {
        return cleaned; // No JSON structure found
    }

    if (firstBrace !== -1 && firstBracket !== -1) {
        startIndex = Math.min(firstBrace, firstBracket);
    } else if (firstBrace !== -1) {
        startIndex = firstBrace;
    } else {
        startIndex = firstBracket;
    }

    const lastBrace = cleaned.lastIndexOf('}');
    const lastBracket = cleaned.lastIndexOf(']');

    let endIndex = -1;

    if (lastBrace !== -1 && lastBracket !== -1) {
        endIndex = Math.max(lastBrace, lastBracket);
    } else if (lastBrace !== -1) {
        endIndex = lastBrace;
    } else {
        endIndex = lastBracket;
    }

    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        return cleaned.substring(startIndex, endIndex + 1);
    }

    return cleaned;
};

export const PropertyTypeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [propertyTypes, setPropertyTypes] = useState<ManagedPropertyType[]>([]);
    const [loading, setLoading] = useState(true);
    const [cache, setCache] = useState<CacheData | null>(null);

    // Get refreshDynamicData from LanguageContext if available
    let refreshLanguageData: (() => Promise<void>) | null = null;
    try {
        const languageContext = useLanguage();
        refreshLanguageData = languageContext.refreshDynamicData;
    } catch {
        // LanguageContext not available, which is fine
    }

    const isCacheValid = (cacheData: CacheData): boolean => {
        return Date.now() - cacheData.timestamp < CACHE_TTL;
    };

    const clearCache = () => {
        setCache(null);
    };

    const fetchPropertyTypes = useCallback(async () => {
        // Check if we have valid cached data
        if (cache && isCacheValid(cache)) {
            setPropertyTypes(cache.data);
            return;
        }

        setLoading(true);
        const { data, error } = await supabase.from('property_type_translations').select('*').order('name', { ascending: true });
        if (error) {
            console.error('Error fetching property types:', error);
            setPropertyTypes([]);
        } else {
            const propertyTypesData = data as ManagedPropertyType[] || [];
            setPropertyTypes(propertyTypesData);

            // Cache the data
            setCache({
                data: propertyTypesData,
                timestamp: Date.now()
            });
        }
        setLoading(false);
    }, [cache]);

    useEffect(() => {
        fetchPropertyTypes();

        const channel = supabase
            .channel('property-type-translations-realtime')
            .on<ManagedPropertyType>(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'property_type_translations' },
                () => {
                    // Refetch all data on any change to ensure consistency and order
                    fetchPropertyTypes();
                }
            );

        // .subscribe(); // Realtime disabled due to server limitations

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchPropertyTypes]);

    const addPropertyType = async (name: string) => {
        const trimmedName = name.trim();
        const normalizedName = trimmedName.toLowerCase();

        const existingPropertyType = propertyTypes.find(pt => pt.name.trim().toLowerCase() === normalizedName);
        if (existingPropertyType) {
            alert(`O tipo de imóvel "${trimmedName}" já existe.`);
            return;
        }

        const { error } = await supabase
            .from('property_type_translations')
            .insert([{ name: trimmedName }]);

        if (error) {
            console.error('Error adding property type:', error);
            alert(`Erro ao adicionar tipo de imóvel: ${error.message}`);
        } else {
            clearCache(); // Clear cache when data changes
            await fetchPropertyTypes();
            if (refreshLanguageData) {
                await refreshLanguageData();
            }
        }
    };

    const updatePropertyType = async (id: string, name: string) => {
        const trimmedName = name.trim();
        const normalizedName = trimmedName.toLowerCase();

        const existingPropertyType = propertyTypes.find(pt => pt.name.trim().toLowerCase() === normalizedName && pt.id !== id);
        if (existingPropertyType) {
            alert(`O tipo de imóvel "${trimmedName}" já existe.`);
            return;
        }

        const { error } = await supabase
            .from('property_type_translations')
            .update({ name: trimmedName })
            .eq('id', id);

        if (error) {
            console.error('Error updating property type:', error);
            alert(`Erro ao atualizar tipo de imóvel: ${error.message}`);
        } else {
            clearCache(); // Clear cache when data changes
            await fetchPropertyTypes();
            if (refreshLanguageData) {
                await refreshLanguageData();
            }
        }
    };

    const deletePropertyType = async (propertyTypeId: string) => {
        const propertyType = propertyTypes.find(pt => pt.id === propertyTypeId);
        if (!propertyType) {
            alert('Tipo de imóvel não encontrado.');
            return;
        }

        // Verificar se há imóveis usando este tipo (a coluna properties.propertyType guarda o nome, não o id)
        const { data: propertiesUsingType, error: propertiesError } = await supabase
            .from('properties')
            .select('id')
            .eq('propertyType', propertyType.name)
            .limit(1);

        if (propertiesError) {
            console.error('Error checking property type usage:', propertiesError);
            alert(`Erro ao verificar uso do tipo de imóvel: ${propertiesError.message}`);
            return;
        }

        if (propertiesUsingType && propertiesUsingType.length > 0) {
            alert(`Não é possível remover o tipo "${propertyType.name}" pois há imóveis cadastrados com esse tipo.`);
            return;
        }

        const { error } = await supabase
            .from('property_type_translations')
            .delete()
            .eq('id', propertyTypeId);

        if (error) {
            console.error('Error deleting property type:', error);
            alert(`Erro ao remover tipo de imóvel: ${error.message}`);
        } else {
            clearCache(); // Clear cache when data changes
            await fetchPropertyTypes();
            if (refreshLanguageData) {
                await refreshLanguageData();
            }
        }
    };

    const translateAllPropertyTypesWithAI = async (aiConfig: AIConfig) => {
        setLoading(true);
        const languagesToTranslate = supportedLanguages.filter(l => l.code !== 'pt-BR');

        const propertyTypesToTranslate = propertyTypes.filter(propertyType => {
            if (!propertyType.translations) return true;
            const propertyTypeTranslations = propertyType.translations as { [key: string]: string };
            return languagesToTranslate.some(lang => !propertyTypeTranslations[lang.code]);
        });

        if (propertyTypesToTranslate.length === 0) {
            alert('Todos os tipos de imóvel já foram traduzidos para todos os idiomas.');
            setLoading(false);
            return;
        }

        const namesToTranslate = propertyTypesToTranslate.map(pt => pt.name);

        try {
            const systemInstruction = `Você é um tradutor profissional. Sua tarefa é traduzir uma lista de tipos de imóveis do português (pt-BR) para vários idiomas. Você DEVE retornar um único objeto JSON válido onde cada chave é um dos nomes de tipo de imóvel originais em português, e seu valor é outro objeto. Este objeto interno deve ter chaves para cada código de idioma ('en-US', 'es-ES', 'fr-FR', 'it-IT') com a tradução correspondente como valor.`;
            const userPrompt = `Traduza a seguinte lista de tipos de imóvel: ${JSON.stringify(namesToTranslate)}. Forneça as traduções para estes códigos de idioma: ${languagesToTranslate.map(l => l.code).join(', ')}. Retorne os dados como um único objeto JSON.`;

            let content: string | null = null;
            const provider = aiConfig.provider.toLowerCase();

            if (provider === 'gemini') {
                const ai = new GoogleGenAI({ apiKey: aiConfig.api_key! });
                const response = await ai.models.generateContent({ model: aiConfig.model!, contents: userPrompt, config: { systemInstruction, responseMimeType: "application/json" } });
                content = response.text;
            } else {
                const openai = new OpenAI({
                    apiKey: aiConfig.api_key!,
                    baseURL: provider === 'openrouter' ? 'https://openrouter.ai/api/v1' : 'https://api.openai.com/v1',
                    dangerouslyAllowBrowser: true
                });
                const response = await openai.chat.completions.create({
                    model: aiConfig.model!,
                    messages: [{ role: "system", content: systemInstruction }, { role: "user", content: userPrompt }],
                    response_format: { type: "json_object" },
                });
                content = response.choices[0].message.content;
            }

            if (!content) throw new Error("A resposta da IA estava vazia.");

            let jsonResponse;
            try {
                const cleanedContent = cleanAIResponse(content);
                jsonResponse = JSON.parse(cleanedContent);
            } catch (parseError) {
                console.error("Falha ao analisar JSON da IA.");
                console.error("Conteúdo original da IA:", content);
                console.error("Erro de parse:", parseError);
                throw new Error("A IA retornou uma resposta em formato JSON inválido.");
            }

            const updates = propertyTypesToTranslate.map(propertyType => {
                const aiTranslations = jsonResponse[propertyType.name];
                if (!aiTranslations) return null;

                const newTranslations = { ...(propertyType.translations || {}) };
                for (const lang of languagesToTranslate) {
                    if (aiTranslations[lang.code]) {
                        (newTranslations as any)[lang.code] = aiTranslations[lang.code];
                    }
                }
                return { id: propertyType.id, name: propertyType.name, translations: newTranslations };
            }).filter((u): u is { id: string; name: string; translations: any; } => u !== null);

            if (updates.length > 0) {
                const { error } = await supabase.from('property_type_translations').upsert(updates);
                if (error) throw error;
                clearCache(); // Clear cache when data changes
                await fetchPropertyTypes();
                if (refreshLanguageData) {
                    await refreshLanguageData();
                }
            }

            alert('Tradução dos tipos de imóvel concluída com sucesso!');

        } catch (error: any) {
            console.error("Erro ao traduzir tipos de imóvel com IA:", error);
            const errorMessage = error.message ? error.message : "Ocorreu um erro desconhecido.";
            alert(`Ocorreu um erro ao traduzir os tipos de imóvel. ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PropertyTypeContext.Provider value={{ propertyTypes, addPropertyType, updatePropertyType, deletePropertyType, translateAllPropertyTypesWithAI, loading }}>
            {children}
        </PropertyTypeContext.Provider>
    );
};

export const usePropertyTypes = () => {
    const context = useContext(PropertyTypeContext);
    if (context === undefined) {
        throw new Error('usePropertyTypes must be used within a PropertyTypeProvider');
    }
    return context;
};
