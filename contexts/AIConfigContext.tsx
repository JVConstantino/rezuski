import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Database } from '../types/supabase';

export type AIConfig = Database['public']['Tables']['ai_configs']['Row'];

interface AIConfigContextType {
    configs: AIConfig[];
    activeConfig: AIConfig | null;
    addConfig: (newConfig: Omit<AIConfig, 'id' | 'created_at' | 'is_active'>) => Promise<void>;
    updateConfig: (configId: string, updatedConfig: Omit<AIConfig, 'id' | 'created_at' | 'is_active'>) => Promise<void>;
    deleteConfig: (configId: string) => Promise<void>;
    setActiveConfig: (configId: string) => Promise<void>;
    loading: boolean;
}

const AIConfigContext = createContext<AIConfigContextType | undefined>(undefined);

export const AIConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [configs, setConfigs] = useState<AIConfig[]>([]);
    const [activeConfig, setActiveConfigState] = useState<AIConfig | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchConfigs = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('ai_configs')
            .select('*')
            .order('provider', { ascending: true });

        if (error) {
            console.error('Error fetching AI configs:', error);
        } else if (data) {
            setConfigs(data);
            setActiveConfigState(data.find(c => c.is_active) || null);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchConfigs();
    }, [fetchConfigs]);

    const addConfig = async (newConfigData: Omit<AIConfig, 'id' | 'created_at' | 'is_active'>) => {
        const { error } = await supabase.from('ai_configs').insert([newConfigData]);
        if (error) {
            console.error('Error adding AI config:', error);
            alert(`Erro ao adicionar configuração: ${error.message}`);
        } else {
            await fetchConfigs();
        }
    };

    const updateConfig = async (configId: string, updatedConfigData: Omit<AIConfig, 'id' | 'created_at' | 'is_active'>) => {
        const { error } = await supabase
            .from('ai_configs')
            .update(updatedConfigData)
            .eq('id', configId);

        if (error) {
            console.error('Error updating AI config:', error);
            alert(`Erro ao atualizar configuração: ${error.message}`);
        } else {
            await fetchConfigs();
        }
    };
    
    const deleteConfig = async (configId: string) => {
         if (!window.confirm('Tem certeza que deseja excluir esta configuração de IA?')) {
            return;
        }
        const { error } = await supabase.from('ai_configs').delete().eq('id', configId);
        if (error) {
            console.error('Error deleting AI config:', error);
            alert(`Erro ao excluir configuração: ${error.message}`);
        } else {
            await fetchConfigs();
        }
    };
    
    const setActiveConfig = async (configId: string) => {
        const { error } = await supabase.rpc('set_active_ai_config', { config_id: configId });
        if (error) {
            console.error('Error setting active AI config:', error);
            alert(`Erro ao ativar configuração: ${error.message}`);
        } else {
            await fetchConfigs();
        }
    };


    return (
        <AIConfigContext.Provider value={{ configs, activeConfig, addConfig, updateConfig, deleteConfig, setActiveConfig, loading }}>
            {children}
        </AIConfigContext.Provider>
    );
};

export const useAIConfig = () => {
    const context = useContext(AIConfigContext);
    if (context === undefined) {
        throw new Error('useAIConfig must be used within an AIConfigProvider');
    }
    return context;
};
