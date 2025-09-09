import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { Category } from '../types';
import { supabase } from '../lib/supabaseClient';
import { AIConfig } from './AIConfigContext';
import { supportedLanguages, useLanguage } from './LanguageContext';
import { GoogleGenAI } from "@google/genai";
import OpenAI from 'openai';

interface CategoryContextType {
    categories: Category[];
    addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
    updateCategory: (updatedCategory: Category) => Promise<void>;
    deleteCategory: (categoryId: string) => Promise<void>;
    translateAllCategoriesWithAI: (aiConfig: AIConfig) => Promise<void>;
    loading: boolean;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

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

export const CategoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Get refreshDynamicData from LanguageContext if available
    let refreshLanguageData: (() => Promise<void>) | null = null;
    try {
        const languageContext = useLanguage();
        refreshLanguageData = languageContext.refreshDynamicData;
    } catch {
        // LanguageContext not available, which is fine
    }

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true });
        if (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        } else {
            setCategories(data || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const addCategory = async (category: Omit<Category, 'id'>) => {
        const { data, error } = await supabase
            .from('categories')
            .insert([category])
            .select()
            .single();

        if (error) {
            console.error('Error adding category:', error);
        } else if (data) {
            await fetchCategories();
            // Refresh LanguageContext data to sync categories
            if (refreshLanguageData) {
                await refreshLanguageData();
            }
        }
    };

    const updateCategory = async (updatedCategory: Category) => {
        const { id, ...updateData } = updatedCategory;
        const { error } = await supabase
            .from('categories')
            .update(updateData)
            .eq('id', id);

        if (error) {
            console.error('Error updating category:', error);
        } else {
            await fetchCategories();
            // Refresh LanguageContext data to sync categories
            if (refreshLanguageData) {
                await refreshLanguageData();
            }
        }
    };

    const deleteCategory = async (categoryId: string) => {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', categoryId);
        
        if (error) {
            console.error('Error deleting category:', error);
        } else {
            await fetchCategories();
            // Refresh LanguageContext data to sync categories
            if (refreshLanguageData) {
                await refreshLanguageData();
            }
        }
    };

    const translateAllCategoriesWithAI = async (aiConfig: AIConfig) => {
        setLoading(true);
        const languagesToTranslate = supportedLanguages.filter(l => l.code !== 'pt-BR');
        
        const categoriesToTranslate = categories.filter(category => {
            if (!category.translations) return true;
            return languagesToTranslate.some(lang => !category.translations![lang.code]);
        });
        
        if (categoriesToTranslate.length === 0) {
            alert('Todas as categorias já foram traduzidas para todos os idiomas.');
            setLoading(false);
            return;
        }
        
        const namesToTranslate = categoriesToTranslate.map(c => c.name);
    
        try {
            const systemInstruction = `Você é um tradutor profissional. Sua tarefa é traduzir uma lista de nomes de categorias imobiliárias do português (pt-BR) para vários idiomas. Você DEVE retornar um único objeto JSON válido onde cada chave é um dos nomes de categoria originais em português, e seu valor é outro objeto. Este objeto interno deve ter chaves para cada código de idioma ('en-US', 'es-ES', 'fr-FR', 'it-IT') com a tradução correspondente como valor.`;
            const userPrompt = `Traduza a seguinte lista de nomes de categorias: ${JSON.stringify(namesToTranslate)}. Forneça as traduções para estes códigos de idioma: ${languagesToTranslate.map(l => l.code).join(', ')}. Retorne os dados como um único objeto JSON.`;
            
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
                console.error("Falha ao analisar JSON da IA para categorias.");
                console.error("Conteúdo original da IA:", content);
                console.error("Erro de parse:", parseError);
                throw new Error("A IA retornou uma resposta em formato JSON inválido.");
            }
    
            const updates = categoriesToTranslate.map(category => {
                const aiTranslations = jsonResponse[category.name];
                if (!aiTranslations) return null;
                
                const newTranslations = { ...(category.translations || {}) };
                for (const lang of languagesToTranslate) {
                    if (aiTranslations[lang.code]) {
                        (newTranslations as any)[lang.code] = aiTranslations[lang.code];
                    }
                }
                return { id: category.id, translations: newTranslations };
            }).filter((u): u is {id: string, translations: any} => u !== null);
    
            if (updates.length > 0) {
                const { error } = await supabase.from('categories').upsert(updates);
                if (error) throw error;
                await fetchCategories(); // Refetch to update state
                // Refresh LanguageContext data to sync categories
                if (refreshLanguageData) {
                    await refreshLanguageData();
                }
            }
            
            alert('Tradução das categorias concluída com sucesso!');
            
        } catch (error: any) {
            console.error("Erro ao traduzir categorias com IA:", error);
            const errorMessage = error.message ? error.message : "Ocorreu um erro desconhecido.";
            alert(`Ocorreu um erro ao traduzir as categorias. ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <CategoryContext.Provider value={{ categories, addCategory, updateCategory, deleteCategory, translateAllCategoriesWithAI, loading }}>
            {!loading && children}
        </CategoryContext.Provider>
    );
};

export const useCategories = () => {
    const context = useContext(CategoryContext);
    if (context === undefined) {
        throw new Error('useCategories must be used within a CategoryProvider');
    }
    return context;
};