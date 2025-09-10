import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';

interface DatabaseConfig {
    id: string;
    database_url: string;
    database_key: string;
    description?: string;
    created_at: string;
    is_active: boolean;
    category_order?: string | null; // ordem das categorias
}

interface DatabaseConfigContextType {
    configs: DatabaseConfig[];
    activeConfig: DatabaseConfig | null;
    loading: boolean;
    addConfig: (config: Omit<DatabaseConfig, 'id' | 'created_at' | 'is_active'>) => Promise<void>;
    updateConfig: (id: string, config: Partial<Omit<DatabaseConfig, 'id' | 'created_at'>>) => Promise<void>;
    deleteConfig: (id: string) => Promise<void>;
    setActiveConfig: (id: string) => Promise<void>;
    setCategoryOrder: (order: string) => Promise<void>; // novo método
}

const DatabaseConfigContext = createContext<DatabaseConfigContextType | undefined>(undefined);

export const DatabaseConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [configs, setConfigs] = useState<DatabaseConfig[]>([]);
    const [activeConfig, setActiveConfigState] = useState<DatabaseConfig | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchConfigs = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('database_configs')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching database configs:', error);
                // Se a tabela não existe, vamos usar configurações padrão
                const defaultConfigs: DatabaseConfig[] = [
                    {
                        id: 'constantino-new',
                        database_url: 'https://constantino-rezuski-db.62mil3.easypanel.host',
                        database_key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE',
                        description: 'Constantino Rezuski Database',
                        created_at: new Date().toISOString(),
                        is_active: true
                    },
                    {
                        id: 'constantino',
                        database_url: 'https://constantino-rezuski-db.62mil3.easypanel.host',
                        database_key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE',
                        description: 'Constantino Supabase Database',
                        created_at: new Date().toISOString(),
                        is_active: false
                    },
                    {
                        id: 'default',
                        database_url: 'https://emofviiywuhaxqoqowup.supabase.co',
                        database_key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtb2Z2aWl5d3VoYXhxb3Fvd3VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1Mzk2NTEsImV4cCI6MjA2ODExNTY1MX0.6APrqMN6YD-_0OQR7jkmEzhZ7Ary0kMGdBRagU5ymhY',
                        description: 'Main Supabase Database',
                        created_at: new Date().toISOString(),
                        is_active: false
                    }
                ];
                setConfigs(defaultConfigs);
                setActiveConfigState(defaultConfigs[0]); // Constantino new config is active by default
                return;
            }

            setConfigs(data || []);
            const active = data?.find(config => config.is_active);
            setActiveConfigState(active || null);
        } catch (error) {
            console.error('Error fetching database configs:', error);
        } finally {
            setLoading(false);
        }
    };

    const addConfig = async (configData: Omit<DatabaseConfig, 'id' | 'created_at' | 'is_active'>) => {
        try {
            const { data, error } = await supabase
                .from('database_configs')
                .insert([{ ...configData, is_active: false }])
                .select()
                .single();

            if (error) {
                console.error('Error adding database config:', error);
                if (error.code === 'PGRST116' || error.message.includes('relation "public.database_configs" does not exist')) {
                    throw new Error('A tabela database_configs não existe no banco de dados. Por favor, crie a tabela primeiro.');
                }
                throw error;
            }

            setConfigs(prev => [data, ...prev]);
        } catch (error) {
            console.error('Error adding database config:', error);
            throw error;
        }
    };

    const updateConfig = async (id: string, configData: Partial<Omit<DatabaseConfig, 'id' | 'created_at'>>) => {
        try {
            const { data, error } = await supabase
                .from('database_configs')
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
            console.error('Error updating database config:', error);
            throw error;
        }
    };

    const deleteConfig = async (id: string) => {
        try {
            if (!id) {
                throw new Error('ID da configuração é obrigatório para exclusão');
            }
            
            console.log('Tentando excluir configuração:', id);
            
            // Verificar se a configuração existe antes de tentar excluir
            const { data: existingConfig, error: fetchError } = await supabase
                .from('database_configs')
                .select('id, is_active')
                .eq('id', id)
                .single();
            
            if (fetchError && fetchError.code !== 'PGRST116') {
                console.error('Erro ao verificar existência da configuração:', fetchError);
                throw fetchError;
            }
            
            if (!existingConfig) {
                console.warn('Configuração não encontrada:', id);
                throw new Error('Configuração não encontrada');
            }
            
            // Verificar se não é a configuração ativa
            if (existingConfig.is_active) {
                throw new Error('Não é possível excluir a configuração ativa');
            }
            
            const { error } = await supabase
                .from('database_configs')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Erro ao excluir configuração:', error);
                throw error;
            }

            console.log('Configuração excluída com sucesso');
            setConfigs(prev => prev.filter(config => config.id !== id));
            if (activeConfig?.id === id) {
                setActiveConfigState(null);
            }
        } catch (error) {
            console.error('Erro na função deleteConfig:', error);
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
                .from('database_configs')
                .select('id')
                .limit(1);

            if (!testError) {
                // Database table exists, update normally
                // First, deactivate all configs
                await supabase
                    .from('database_configs')
                    .update({ is_active: false })
                    .neq('id', '');

                // Then activate the selected one
                const { data, error } = await supabase
                    .from('database_configs')
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
                console.log('Using fallback database config selection');
                setConfigs(prev => prev.map(config => ({
                    ...config,
                    is_active: config.id === id
                })));
                setActiveConfigState(targetConfig);
            }
        } catch (error) {
            console.error('Error setting active database config:', error);
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

    const setCategoryOrder = async (order: string) => {
        try {
            if (!activeConfig) {
                console.error('No active config to update category order');
                return;
            }

            // Update the database
            const { error } = await supabase
                .from('database_configs')
                .update({ category_order: order })
                .eq('id', activeConfig.id);

            if (error) {
                console.error('Error updating category order:', error);
                throw error;
            }

            // Update local state
            setConfigs(prev => prev.map(config => 
                config.id === activeConfig.id 
                    ? { ...config, category_order: order }
                    : config
            ));
            
            setActiveConfigState(prev => prev ? { ...prev, category_order: order } : prev);
        } catch (error) {
            console.error('Error setting category order:', error);
            throw error;
        }
    };

    useEffect(() => {
        fetchConfigs();
    }, []);

    return (
        <DatabaseConfigContext.Provider value={{
            configs,
            activeConfig,
            loading,
            addConfig,
            updateConfig,
            deleteConfig,
            setActiveConfig,
            setCategoryOrder
        }}>
            {children}
        </DatabaseConfigContext.Provider>
    );
};

export const useDatabaseConfig = () => {
    const context = useContext(DatabaseConfigContext);
    if (context === undefined) {
        throw new Error('useDatabaseConfig must be used within a DatabaseConfigProvider');
    }
    return context;
};