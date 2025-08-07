import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ManagedAmenity } from '../types';
import { AIConfig } from './AIConfigContext';
import { supportedLanguages } from './LanguageContext';
import { GoogleGenAI } from "@google/genai";
import OpenAI from 'openai';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface AmenityContextType {
    amenities: ManagedAmenity[];
    addAmenity: (name: string) => Promise<void>;
    updateAmenity: (id: string, name: string) => Promise<void>;
    deleteAmenity: (amenityId: string) => Promise<void>;
    translateAllAmenitiesWithAI: (aiConfig: AIConfig) => Promise<void>;
    loading: boolean;
}

const AmenityContext = createContext<AmenityContextType | undefined>(undefined);

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

export const AmenityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [amenities, setAmenities] = useState<ManagedAmenity[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAmenities = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('amenities').select('*').order('name', { ascending: true });
        if (error) {
            console.error('Error fetching amenities:', error);
            setAmenities([]);
        } else {
            setAmenities(data as ManagedAmenity[] || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchAmenities();

        const channel = supabase
            .channel('amenities-realtime')
            .on<ManagedAmenity>(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'amenities' },
                (payload) => {
                    const { eventType, new: newRecord, old: oldRecord } = payload;
                    
                    if (eventType === 'INSERT') {
                        setAmenities(prev => [...prev, newRecord].sort((a, b) => a.name.localeCompare(b.name)));
                    } else if (eventType === 'UPDATE') {
                        setAmenities(prev => prev.map(a => a.id === newRecord.id ? newRecord : a).sort((a, b) => a.name.localeCompare(b.name)));
                    } else if (eventType === 'DELETE') {
                        const oldId = (oldRecord as { id: string }).id;
                        setAmenities(prev => prev.filter(a => a.id !== oldId));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchAmenities]);

    const addAmenity = async (name: string) => {
        const { error } = await supabase
            .from('amenities')
            .insert([{ name }]);

        if (error) {
            console.error('Error adding amenity:', error);
            alert(`Erro ao adicionar comodidade: ${error.message}`);
        }
    };

    const updateAmenity = async (id: string, name: string) => {
        const { error } = await supabase
            .from('amenities')
            .update({ name })
            .eq('id', id);

        if (error) {
            console.error('Error updating amenity:', error);
            alert(`Erro ao atualizar comodidade: ${error.message}`);
        }
    };

    const deleteAmenity = async (amenityId: string) => {
        const { error } = await supabase
            .from('amenities')
            .delete()
            .eq('id', amenityId);
        
        if (error) {
            console.error('Error deleting amenity:', error);
            alert(`Erro ao remover comodidade: ${error.message}`);
        }
    };

    const translateAllAmenitiesWithAI = async (aiConfig: AIConfig) => {
        setLoading(true);
        const languagesToTranslate = supportedLanguages.filter(l => l.code !== 'pt-BR');
        
        const amenitiesToTranslate = amenities.filter(amenity => {
            if (!amenity.translations) return true;
            const amenityTranslations = amenity.translations as { [key: string]: string };
            return languagesToTranslate.some(lang => !amenityTranslations[lang.code]);
        });
    
        if (amenitiesToTranslate.length === 0) {
            alert('Todas as comodidades já foram traduzidas para todos os idiomas.');
            setLoading(false);
            return;
        }
    
        const namesToTranslate = amenitiesToTranslate.map(a => a.name);
    
        try {
            const systemInstruction = `Você é um tradutor profissional. Sua tarefa é traduzir uma lista de nomes de comodidades imobiliárias do português (pt-BR) para vários idiomas. Você DEVE retornar um único objeto JSON válido onde cada chave é um dos nomes de comodidade originais em português, e seu valor é outro objeto. Este objeto interno deve ter chaves para cada código de idioma ('en-US', 'es-ES', 'fr-FR', 'it-IT') com a tradução correspondente como valor.`;
            const userPrompt = `Traduza a seguinte lista de nomes de comodidades: ${JSON.stringify(namesToTranslate)}. Forneça as traduções para estes códigos de idioma: ${languagesToTranslate.map(l => l.code).join(', ')}. Retorne os dados como um único objeto JSON.`;
    
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
    
            const cleanedContent = cleanAIResponse(content);
            const jsonResponse = JSON.parse(cleanedContent);
            
            const updates = amenitiesToTranslate.map(amenity => {
                const aiTranslations = jsonResponse[amenity.name];
                if (!aiTranslations) return null;
    
                const newTranslations = { ...(amenity.translations || {}) };
                for (const lang of languagesToTranslate) {
                    if (aiTranslations[lang.code]) {
                        (newTranslations as any)[lang.code] = aiTranslations[lang.code];
                    }
                }
                return { id: amenity.id, name: amenity.name, translations: newTranslations };
            }).filter((u): u is { id: string; name: string; translations: any; } => u !== null);
    
            if (updates.length > 0) {
                const { error } = await supabase.from('amenities').upsert(updates);
                if (error) throw error;
                await fetchAmenities(); // Refetch data to update UI
            }
            
            alert('Tradução das comodidades concluída com sucesso!');
    
        } catch (error: any) {
            console.error("Erro ao traduzir comodidades com IA:", error);
            const errorMessage = error.message ? error.message : "Ocorreu um erro desconhecido.";
            alert(`Ocorreu um erro ao traduzir as comodidades. A resposta da IA pode estar em um formato inesperado. Detalhes: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AmenityContext.Provider value={{ amenities, addAmenity, updateAmenity, deleteAmenity, translateAllAmenitiesWithAI, loading }}>
            {!loading && children}
        </AmenityContext.Provider>
    );
};

export const useAmenities = () => {
    const context = useContext(AmenityContext);
    if (context === undefined) {
        throw new Error('useAmenities must be used within an AmenityProvider');
    }
    return context;
};
