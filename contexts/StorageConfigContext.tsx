import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';

interface StorageConfig {
    id: string;
    storage_url: string;
    storage_key: string;
    bucket_name: string;
    created_at: string;
    is_active: boolean;
}

interface StorageConfigContextType {
    configs: StorageConfig[];
    activeConfig: StorageConfig | null;
    loading: boolean;
    addConfig: (config: Omit<StorageConfig, 'id' | 'created_at' | 'is_active'>) => Promise<void>;
    updateConfig: (id: string, config: Partial<Omit<StorageConfig, 'id' | 'created_at'>>) => Promise<void>;
    deleteConfig: (id: string) => Promise<void>;
    setActiveConfig: (id: string) => Promise<void>;
}

const StorageConfigContext = createContext<StorageConfigContextType | undefined>(undefined);

export const StorageConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [configs, setConfigs] = useState<StorageConfig[]>([]);
    const [activeConfig, setActiveConfigState] = useState<StorageConfig | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchConfigs = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('storage_configs')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching storage configs:', error);
                // Se a tabela não existe, vamos usar configurações padrão
                const defaultConfigs: StorageConfig[] = [
                    {
                        id: 'constantino',
                        storage_url: 'https://constantino-supabase.62mil3.easypanel.host',
                        storage_key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE',
                        bucket_name: 'property-images',
                        created_at: new Date().toISOString(),
                        is_active: true
                    },
                    {
                        id: 'default',
                        storage_url: 'https://emofviiywuhaxqoqowup.supabase.co',
                        storage_key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtb2Z2aWl5d3VoYXhxb3Fvd3VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1Mzk2NTEsImV4cCI6MjA2ODExNTY1MX0.6APrqMN6YD-_0OQR7jkmEzhZ7Ary0kMGdBRagU5ymhY',
                        bucket_name: 'property-images',
                        created_at: new Date().toISOString(),
                        is_active: false
                    }
                ];
                setConfigs(defaultConfigs);
                setActiveConfigState(defaultConfigs[0]); // Constantino config is active by default
                return;
            }

            setConfigs(data || []);
            const active = data?.find(config => config.is_active);
            setActiveConfigState(active || null);
        } catch (error) {
            console.error('Error fetching storage configs:', error);
        } finally {
            setLoading(false);
        }
    };

    const addConfig = async (configData: Omit<StorageConfig, 'id' | 'created_at' | 'is_active'>) => {
        try {
            const { data, error } = await supabase
                .from('storage_configs')
                .insert([{ ...configData, is_active: false }])
                .select()
                .single();

            if (error) {
                console.error('Error adding storage config:', error);
                if (error.code === 'PGRST116' || error.message.includes('relation "public.storage_configs" does not exist')) {
                    throw new Error('A tabela storage_configs não existe no banco de dados. Por favor, crie a tabela primeiro.');
                }
                throw error;
            }

            setConfigs(prev => [data, ...prev]);
        } catch (error) {
            console.error('Error adding storage config:', error);
            throw error;
        }
    };

    const updateConfig = async (id: string, configData: Partial<Omit<StorageConfig, 'id' | 'created_at'>>) => {
        try {
            const { data, error } = await supabase
                .from('storage_configs')
                .update(configData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            setConfigs(prev => prev.map(config => config.id === id ? data : config));
            if (data.is_active) {
                setActiveConfigState(data);
            }
        } catch (error) {
            console.error('Error updating storage config:', error);
            throw error;
        }
    };

    const deleteConfig = async (id: string) => {
        try {
            const { error } = await supabase
                .from('storage_configs')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setConfigs(prev => prev.filter(config => config.id !== id));
            if (activeConfig?.id === id) {
                setActiveConfigState(null);
            }
        } catch (error) {
            console.error('Error deleting storage config:', error);
            throw error;
        }
    };

    const setActiveConfig = async (id: string) => {
        try {
            // Check if we're working with database configs or fallback configs
            const targetConfig = configs.find(config => config.id === id);
            if (!targetConfig) {
                console.error('Config not found:', id);
                return;
            }

            // If we have database connectivity, try to update the database
            const { data: testData, error: testError } = await supabase
                .from('storage_configs')
                .select('id')
                .limit(1);

            if (!testError) {
                // Database table exists, update normally
                // First, deactivate all configs
                await supabase
                    .from('storage_configs')
                    .update({ is_active: false })
                    .neq('id', '');

                // Then activate the selected one
                const { data, error } = await supabase
                    .from('storage_configs')
                    .update({ is_active: true })
                    .eq('id', id)
                    .select()
                    .single();

                if (error) throw error;

                setConfigs(prev => prev.map(config => ({
                    ...config,
                    is_active: config.id === id
                })));
                setActiveConfigState(data);
            } else {
                // Database table doesn't exist, update local state only
                console.log('Using fallback storage config selection');
                setConfigs(prev => prev.map(config => ({
                    ...config,
                    is_active: config.id === id
                })));
                setActiveConfigState(targetConfig);
            }
        } catch (error) {
            console.error('Error setting active storage config:', error);
            // Fallback to local state update
            const targetConfig = configs.find(config => config.id === id);
            if (targetConfig) {
                setConfigs(prev => prev.map(config => ({
                    ...config,
                    is_active: config.id === id
                })));
                setActiveConfigState(targetConfig);
            }
        }
    };

    useEffect(() => {
        fetchConfigs();
    }, []);

    return (
        <StorageConfigContext.Provider value={{
            configs,
            activeConfig,
            loading,
            addConfig,
            updateConfig,
            deleteConfig,
            setActiveConfig
        }}>
            {children}
        </StorageConfigContext.Provider>
    );
};

export const useStorageConfig = () => {
    const context = useContext(StorageConfigContext);
    if (context === undefined) {
        throw new Error('useStorageConfig must be used within a StorageConfigProvider');
    }
    return context;
};