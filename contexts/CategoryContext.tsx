import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Category } from '../types';
import { supabase } from '../lib/supabaseClient';
import { AIConfig } from './AIConfigContext';
import { supportedLanguages } from './LanguageContext';
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

export const CategoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCategories = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('categories').select('*');
        if (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        } else {
            setCategories(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const addCategory = async (category: Omit<Category, 'id'>) => {
        const { data, error } = await supabase
            .from('categories')
            .insert([category])
            .select()
            .single();

        if (error) {
            console.error('Error adding category:', error);
        } else if (data) {
            setCategories(prev => [...prev, data]);
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
            setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
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
            setCategories(prev => prev.filter(c => c.id !== categoryId));
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
            
            const jsonResponse = JSON.parse(content);
    
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
            }
            
            alert('Tradução das categorias concluída com sucesso!');
            
        } catch (error) {
            console.error("Erro ao traduzir categorias com IA:", error);
            alert("Ocorreu um erro ao traduzir as categorias. Verifique o console para mais detalhes.");
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