import React, { useState, useEffect } from 'react';
import { UserCircleIcon, BellIcon, ShieldIcon, SparklesIcon, EyeIcon, EyeOffIcon, PlusIcon, EditIcon, TrashIcon, XIcon, CloudIcon, DatabaseIcon } from '../../components/Icons';
import { useAuth } from '../../contexts/AuthContext';
import { useAIConfig, AIConfig } from '../../contexts/AIConfigContext';
import { useStorageConfig } from '../../contexts/StorageConfigContext';
import { useDatabaseConfig } from '../../contexts/DatabaseConfigContext';

const ProfileSettings: React.FC = () => {
    const { user, updateProfile } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);
        try {
            await updateProfile({ name });
            setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Falha ao atualizar o perfil.' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold text-slate-800">Perfil</h2>
            <p className="text-slate-500 mt-1">Gerencie as informações do seu perfil.</p>
            <form onSubmit={handleSave} className="mt-6 space-y-6 max-w-lg">
                <div className="flex items-center space-x-4">
                    <img src={user?.avatarUrl} alt={user?.name} className="w-16 h-16 rounded-full" />
                    <button type="button" className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-100">Mudar Foto</button>
                </div>
                 <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">Nome Completo</label>
                    <input id="fullName" type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm" />
                </div>
                 <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
                    <input id="email" type="email" defaultValue={user?.email} disabled className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm bg-slate-50 text-slate-500 sm:text-sm" />
                </div>
                {message && (
                    <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message.text}
                    </div>
                )}
                <div className="pt-4">
                    <button type="submit" disabled={isSaving} className="bg-primary-green text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:opacity-95 disabled:opacity-50">
                         {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const NotificationSettings: React.FC = () => {
    return (
        <div>
            <h2 className="text-xl font-bold text-slate-800">Notificações</h2>
            <p className="text-slate-500 mt-1">Gerencie como você recebe notificações.</p>
            <div className="mt-6 space-y-4 max-w-lg">
                <p className="text-slate-600">Configurações de notificação em breve.</p>
            </div>
        </div>
    );
};

const SecuritySettings: React.FC = () => {
    return (
        <div>
            <h2 className="text-xl font-bold text-slate-800">Segurança</h2>
            <p className="text-slate-500 mt-1">Altere sua senha e gerencie a segurança da conta.</p>
            <div className="mt-6 space-y-6 max-w-lg">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Senha Atual</label>
                    <input type="password" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700">Nova Senha</label>
                    <input type="password" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm" />
                </div>
                <div className="pt-4">
                    <button className="bg-primary-green text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:opacity-95">Atualizar Senha</button>
                </div>
            </div>
        </div>
    );
};

const AIConfigForm: React.FC<{
    config: Omit<AIConfig, 'id' | 'created_at' | 'is_active'>;
    onConfigChange: (field: keyof Omit<AIConfig, 'id' | 'created_at' | 'is_active'>, value: string | number | null) => void;
    showApiKey: boolean;
    onToggleShowApiKey: () => void;
}> = ({ config, onConfigChange, showApiKey, onToggleShowApiKey }) => {
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        onConfigChange(
            name as keyof typeof config,
            name === 'max_tokens' ? (value ? parseInt(value, 10) : null) : value
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <label htmlFor="provider" className="block text-sm font-medium text-slate-700">Provedor de IA</label>
                <input
                    id="provider"
                    name="provider"
                    type="text"
                    value={config.provider || ''}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"
                    placeholder="Ex: Gemini, OpenAI"
                />
            </div>
            <div>
                <label htmlFor="api_key" className="block text-sm font-medium text-slate-700">API Key</label>
                <div className="relative mt-1">
                    <input
                        id="api_key"
                        name="api_key"
                        type={showApiKey ? 'text' : 'password'}
                        value={config.api_key || ''}
                        onChange={handleInputChange}
                        required
                        className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"
                        placeholder="Cole sua chave de API aqui"
                    />
                    <button
                        type="button"
                        onClick={onToggleShowApiKey}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500"
                    >
                        {showApiKey ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                </div>
            </div>
            <div>
                <label htmlFor="model" className="block text-sm font-medium text-slate-700">Modelo</label>
                <input
                    id="model"
                    name="model"
                    type="text"
                    value={config.model || ''}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"
                    placeholder="Ex: gemini-2.5-flash"
                />
            </div>
            <div>
                <label htmlFor="max_tokens" className="block text-sm font-medium text-slate-700">Máximo de Tokens (Opcional)</label>
                <input
                    id="max_tokens"
                    name="max_tokens"
                    type="number"
                    value={config.max_tokens || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"
                />
            </div>
        </div>
    );
};


const AISettings: React.FC = () => {
    const { configs, activeConfig, addConfig, updateConfig, deleteConfig, setActiveConfig, loading } = useAIConfig();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingConfig, setEditingConfig] = useState<AIConfig | null>(null);
    const [formData, setFormData] = useState<Omit<AIConfig, 'id' | 'created_at' | 'is_active'>>({
        provider: '', api_key: '', model: '', max_tokens: null
    });
    const [showApiKey, setShowApiKey] = useState(false);

    const openModalForNew = () => {
        setEditingConfig(null);
        setFormData({ provider: '', api_key: '', model: '', max_tokens: null });
        setShowApiKey(false);
        setIsModalOpen(true);
    };

    const openModalForEdit = (config: AIConfig) => {
        setEditingConfig(config);
        setFormData({
            provider: config.provider,
            api_key: config.api_key,
            model: config.model,
            max_tokens: config.max_tokens
        });
        setShowApiKey(false);
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingConfig) {
            await updateConfig(editingConfig.id, formData);
        } else {
            await addConfig(formData);
        }
        setIsModalOpen(false);
    };
    
    const handleFormChange = (field: keyof typeof formData, value: string | number | null) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div>
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Inteligência Artificial</h2>
                    <p className="text-slate-500 mt-1">Gerencie e selecione o provedor de IA para a aplicação.</p>
                </div>
                <button onClick={openModalForNew} className="flex items-center bg-primary-green text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:opacity-95">
                    <PlusIcon className="w-5 h-5 mr-2" /> Adicionar Provedor
                </button>
            </div>
            <div className="mt-6 space-y-4">
                {loading ? <p>Carregando...</p> : configs.map(config => (
                    <div key={config.id} className="p-4 border border-slate-200 rounded-lg flex items-center justify-between">
                        <div className="flex items-center">
                             <input
                                type="radio"
                                name="active_ai_config"
                                id={`config-${config.id}`}
                                checked={config.is_active}
                                onChange={() => setActiveConfig(config.id)}
                                className="h-5 w-5 text-primary-blue focus:ring-primary-blue border-slate-300"
                            />
                            <label htmlFor={`config-${config.id}`} className="ml-3">
                                <p className="font-bold text-slate-800">{config.provider}</p>
                                <p className="text-sm text-slate-500">{config.model}</p>
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button onClick={() => openModalForEdit(config)} className="p-2 text-slate-500 hover:text-primary-blue rounded-md hover:bg-slate-100" title="Editar"><EditIcon className="w-5 h-5"/></button>
                            <button onClick={() => deleteConfig(config.id)} className="p-2 text-slate-500 hover:text-red-600 rounded-md hover:bg-slate-100" title="Excluir"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                        <form onSubmit={handleSave}>
                            <header className="p-4 border-b border-slate-200 flex justify-between items-center">
                                <h3 className="text-lg font-bold">{editingConfig ? 'Editar' : 'Adicionar'} Provedor de IA</h3>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700"><XIcon className="w-6 h-6"/></button>
                            </header>
                            <main className="p-6">
                                <AIConfigForm
                                    config={formData}
                                    onConfigChange={handleFormChange}
                                    showApiKey={showApiKey}
                                    onToggleShowApiKey={() => setShowApiKey(prev => !prev)}
                                />
                            </main>
                            <footer className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-100">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-primary-green text-white font-semibold rounded-lg shadow-md hover:opacity-95">Salvar</button>
                            </footer>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const StorageConfigForm: React.FC<{
    config: {
        storage_url: string;
        storage_key: string;
        bucket_name?: string;  // Make bucket_name optional
    };
    onConfigChange: (field: string, value: string) => void;
    showApiKey: boolean;
    onToggleShowApiKey: () => void;
}> = ({ config, onConfigChange, showApiKey, onToggleShowApiKey }) => {
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        onConfigChange(name, value);
    };

    return (
        <div className="space-y-6">
            <div>
                <label htmlFor="storage_url" className="block text-sm font-medium text-slate-700">URL do Supabase</label>
                <input
                    id="storage_url"
                    name="storage_url"
                    type="url"
                    value={config.storage_url || ''}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"
                    placeholder="https://seu-projeto.supabase.co"
                />
            </div>
            <div>
                <label htmlFor="storage_key" className="block text-sm font-medium text-slate-700">Chave Anônima (anon key)</label>
                <div className="relative mt-1">
                    <input
                        id="storage_key"
                        name="storage_key"
                        type={showApiKey ? 'text' : 'password'}
                        value={config.storage_key || ''}
                        onChange={handleInputChange}
                        required
                        className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"
                        placeholder="Cole sua chave anônima aqui"
                    />
                    <button
                        type="button"
                        onClick={onToggleShowApiKey}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500"
                    >
                        {showApiKey ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                </div>
            </div>
            <div>
                <label htmlFor="bucket_name" className="block text-sm font-medium text-slate-700">Nome do Bucket (Opcional)</label>
                <input
                    id="bucket_name"
                    name="bucket_name"
                    type="text"
                    value={config.bucket_name || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"
                    placeholder="Ex: property-images (deixe em branco se não necessário)"
                />
            </div>
        </div>
    );
};

const DatabaseConfigForm: React.FC<{
    config: {
        database_url: string;
        database_key: string;
        description?: string;
    };
    onConfigChange: (field: string, value: string) => void;
    showApiKey: boolean;
    onToggleShowApiKey: () => void;
}> = ({ config, onConfigChange, showApiKey, onToggleShowApiKey }) => {
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        onConfigChange(name, value);
    };

    return (
        <div className="space-y-6">
            <div>
                <label htmlFor="database_url" className="block text-sm font-medium text-slate-700">URL do Supabase</label>
                <input
                    id="database_url"
                    name="database_url"
                    type="url"
                    value={config.database_url || ''}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"
                    placeholder="https://seu-projeto.supabase.co"
                />
            </div>
            <div>
                <label htmlFor="database_key" className="block text-sm font-medium text-slate-700">Chave Anônima (anon key)</label>
                <div className="relative mt-1">
                    <input
                        id="database_key"
                        name="database_key"
                        type={showApiKey ? 'text' : 'password'}
                        value={config.database_key || ''}
                        onChange={handleInputChange}
                        required
                        className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"
                        placeholder="Cole sua chave anônima aqui"
                    />
                    <button
                        type="button"
                        onClick={onToggleShowApiKey}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500"
                    >
                        {showApiKey ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                </div>
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700">Descrição (Opcional)</label>
                <textarea
                    id="description"
                    name="description"
                    value={config.description || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"
                    placeholder="Ex: Banco de dados principal, Banco de teste, etc."
                />
            </div>
        </div>
    );
};

const DatabaseSettings: React.FC = () => {
    const { configs, activeConfig, addConfig, updateConfig, deleteConfig, setActiveConfig, loading } = useDatabaseConfig();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingConfig, setEditingConfig] = useState<any>(null);
    const [formData, setFormData] = useState({
        database_url: '', 
        database_key: '', 
        description: ''
    });
    const [showApiKey, setShowApiKey] = useState(false);
    const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

    // Auto-hide notification after 3 seconds
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleDatabaseConfigChange = async (id: string) => {
        try {
            await setActiveConfig(id);
            const config = configs.find(c => c.id === id);
            if (config) {
                setNotification({
                    type: 'success',
                    message: `Banco de dados alterado para: ${new URL(config.database_url).hostname}`
                });
            }
        } catch (error) {
            setNotification({
                type: 'error',
                message: 'Erro ao alterar configuração de banco de dados'
            });
        }
    };

    const testDatabaseConnection = async (config: any) => {
        try {
            setNotification({ type: 'success', message: 'Testando conexão...' });
            
            // Import supabase dynamically to test connection
            const { createClient } = await import('@supabase/supabase-js');
            const testClient = createClient(config.database_url, config.database_key);
            
            // Test connection by making a simple query
            const { data, error } = await testClient
                .from('profiles')
                .select('id')
                .limit(1);
                
            if (error) {
                setNotification({
                    type: 'error',
                    message: `❌ Erro de conexão: ${error.message}`
                });
                return;
            }
            
            setNotification({
                type: 'success',
                message: `✅ Conexão testada com sucesso! Banco de dados acessível.`
            });
            
        } catch (error: any) {
            setNotification({
                type: 'error',
                message: `❌ Erro de conexão: ${error.message || 'Erro desconhecido'}`
            });
        }
    };

    const openModalForNew = () => {
        setEditingConfig(null);
        setFormData({ database_url: '', database_key: '', description: '' });
        setShowApiKey(false);
        setIsModalOpen(true);
    };

    const openModalForEdit = (config: any) => {
        setEditingConfig(config);
        setFormData({
            database_url: config.database_url,
            database_key: config.database_key,
            description: config.description || ''
        });
        setShowApiKey(false);
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingConfig) {
                await updateConfig(editingConfig.id, formData);
            } else {
                await addConfig(formData);
            }
            setIsModalOpen(false);
        } catch (error: any) {
            console.error('Database config save error:', error);
            if (error.message?.includes('tabela database_configs não existe')) {
                alert('Erro: A tabela database_configs não existe no banco de dados.\n\nPara resolver, execute este SQL no Supabase:\n\nCREATE TABLE database_configs (\n  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,\n  database_url TEXT NOT NULL,\n  database_key TEXT NOT NULL,\n  description TEXT,\n  is_active BOOLEAN DEFAULT false,\n  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()\n);');
            } else {
                alert(`Erro ao salvar configuração de banco de dados: ${error.message || 'Erro desconhecido'}`);
            }
        }
    };
    
    const handleFormChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div>
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Banco de Dados</h2>
                    <p className="text-slate-500 mt-1">Configure qual banco de dados usar para armazenar todos os dados do site.</p>
                </div>
                <button onClick={openModalForNew} className="flex items-center bg-primary-green text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:opacity-95">
                    <PlusIcon className="w-5 h-5 mr-2" /> Adicionar Banco
                </button>
            </div>

            {/* Notification */}
            {notification && (
                <div className={`mt-4 p-4 rounded-lg ${
                    notification.type === 'success' 
                        ? 'bg-green-50 border border-green-200 text-green-700'
                        : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                    <p className="text-sm font-medium">{notification.message}</p>
                </div>
            )}

            {/* Active Database Indicator */}
            {activeConfig && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-blue-900">
                                Banco de Dados Ativo: <span className="font-bold">{new URL(activeConfig.database_url).hostname}</span>
                            </p>
                            <p className="text-sm text-blue-700">
                                {activeConfig.description || 'Sem descrição'} | Todos os dados do site são armazenados neste banco
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-6 space-y-4">
                {loading ? <p>Carregando...</p> : configs.map(config => (
                    <div 
                        key={config.id} 
                        className={`p-4 border rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                            config.is_active 
                                ? 'border-blue-300 bg-blue-50 shadow-sm' 
                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                        onClick={() => handleDatabaseConfigChange(config.id)}
                    >
                        <div className="flex items-center">
                             <input
                                type="radio"
                                name="active_database_config"
                                id={`database-config-${config.id}`}
                                checked={config.is_active}
                                onChange={() => handleDatabaseConfigChange(config.id)}
                                className="h-5 w-5 text-primary-blue focus:ring-primary-blue border-slate-300"
                            />
                            <label htmlFor={`database-config-${config.id}`} className="ml-3 cursor-pointer">
                                <div className="flex items-center">
                                    <p className="font-bold text-slate-800">{new URL(config.database_url).hostname}</p>
                                    {config.is_active && (
                                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Ativo
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-500">{config.description || 'Sem descrição'}</p>
                                {config.id === 'constantino-new' && (
                                    <p className="text-xs text-blue-600">Constantino Rezuski DB</p>
                                )}
                                {config.id === 'constantino' && (
                                    <p className="text-xs text-blue-600">Constantino Supabase</p>
                                )}
                                {config.id === 'default' && (
                                    <p className="text-xs text-slate-400">Supabase Principal</p>
                                )}
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button 
                                onClick={(e) => { e.stopPropagation(); testDatabaseConnection(config); }} 
                                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors" 
                                title="Testar conexão"
                            >
                                Testar
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); openModalForEdit(config); }} 
                                className="p-2 text-slate-500 hover:text-primary-blue rounded-md hover:bg-slate-100" 
                                title="Editar"
                            >
                                <EditIcon className="w-5 h-5"/>
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); deleteConfig(config.id); }} 
                                className="p-2 text-slate-500 hover:text-red-600 rounded-md hover:bg-slate-100" 
                                title="Excluir"
                            >
                                <TrashIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>
                ))}
                {!loading && configs.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                        <DatabaseIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Nenhuma configuração de banco de dados encontrada.</p>
                        <p className="text-sm">Adicione uma configuração para escolher qual banco usar.</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                        <form onSubmit={handleSave}>
                            <header className="p-4 border-b border-slate-200 flex justify-between items-center">
                                <h3 className="text-lg font-bold">{editingConfig ? 'Editar' : 'Adicionar'} Configuração de Banco de Dados</h3>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700"><XIcon className="w-6 h-6"/></button>
                            </header>
                            <main className="p-6">
                                <DatabaseConfigForm
                                    config={formData}
                                    onConfigChange={handleFormChange}
                                    showApiKey={showApiKey}
                                    onToggleShowApiKey={() => setShowApiKey(prev => !prev)}
                                />
                            </main>
                            <footer className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-100">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-primary-green text-white font-semibold rounded-lg shadow-md hover:opacity-95">Salvar</button>
                            </footer>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};


const StorageSettings: React.FC = () => {
    const { configs, activeConfig, addConfig, updateConfig, deleteConfig, setActiveConfig, loading } = useStorageConfig();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingConfig, setEditingConfig] = useState<any>(null);
    const [formData, setFormData] = useState({
        storage_url: '', 
        storage_key: '', 
        bucket_name: ''  // Initialize as empty string, which is valid for optional field
    });
    const [showApiKey, setShowApiKey] = useState(false);
    const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

    // Auto-hide notification after 3 seconds
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleStorageConfigChange = async (id: string) => {
        try {
            await setActiveConfig(id);
            const config = configs.find(c => c.id === id);
            if (config) {
                setNotification({
                    type: 'success',
                    message: `Armazenamento alterado para: ${new URL(config.storage_url).hostname}`
                });
            }
        } catch (error) {
            setNotification({
                type: 'error',
                message: 'Erro ao alterar configuração de armazenamento'
            });
        }
    };

    const testStorageConnection = async (config: any) => {
        try {
            setNotification({ type: 'success', message: 'Testando conexão...' });
            
            const { getStorageClient } = await import('../../lib/storageClient');
            const client = getStorageClient(config.storage_url, config.storage_key);
            
            // If no bucket is specified, just test the basic connection
            if (!config.bucket_name || config.bucket_name.trim() === '') {
                // Test basic connection by trying to list buckets
                const { data: buckets, error: bucketsError } = await client.storage.listBuckets();
                
                if (bucketsError) {
                    setNotification({
                        type: 'error',
                        message: `❌ Erro de conexão: ${bucketsError.message}`
                    });
                    return;
                }
                
                setNotification({
                    type: 'success',
                    message: `✅ Conexão testada com sucesso! ${buckets?.length || 0} buckets disponíveis.`
                });
                return;
            }
            
            setNotification({ type: 'success', message: 'Testando conexão e bucket...' });
            
            // Test bucket access - this confirms the bucket exists and is accessible
            const { data: files, error: filesError } = await client.storage
                .from(config.bucket_name)
                .list('', { limit: 10 });
                
            if (filesError) {
                setNotification({
                    type: 'error',
                    message: `❌ Bucket inacessível: ${filesError.message}`
                });
                return;
            }
            
            // Test URL generation
            const { data: urlData } = client.storage
                .from(config.bucket_name)
                .getPublicUrl('test-image.jpg');
            
            // Test URL accessibility by making a HEAD request
            let urlStatus = 'Unknown';
            try {
                const response = await fetch(urlData.publicUrl, { method: 'HEAD' });
                urlStatus = response.status === 404 ? 'Accessible' : `Status: ${response.status}`;
            } catch (fetchError) {
                urlStatus = 'Connection Error';
            }
            
            setNotification({
                type: 'success',
                message: `✅ Teste completo! Bucket "${config.bucket_name}" acessível com ${files?.length || 0} arquivos. URLs funcionando (${urlStatus}).`
            });
            
        } catch (error: any) {
            setNotification({
                type: 'error',
                message: `❌ Erro de conexão: ${error.message || 'Erro desconhecido'}`
            });
        }
    };

    const openModalForNew = () => {
        setEditingConfig(null);
        setFormData({ storage_url: '', storage_key: '', bucket_name: '' });
        setShowApiKey(false);
        setIsModalOpen(true);
    };

    const openModalForEdit = (config: any) => {
        setEditingConfig(config);
        setFormData({
            storage_url: config.storage_url,
            storage_key: config.storage_key,
            bucket_name: config.bucket_name
        });
        setShowApiKey(false);
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingConfig) {
                await updateConfig(editingConfig.id, formData);
            } else {
                await addConfig(formData);
            }
            setIsModalOpen(false);
        } catch (error: any) {
            console.error('Storage config save error:', error);
            if (error.message?.includes('tabela storage_configs não existe')) {
                alert('Erro: A tabela storage_configs não existe no banco de dados.\n\nPara resolver, execute este SQL no Supabase:\n\nCREATE TABLE storage_configs (\n  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,\n  storage_url TEXT NOT NULL,\n  storage_key TEXT NOT NULL,\n  bucket_name TEXT NOT NULL,\n  is_active BOOLEAN DEFAULT false,\n  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()\n);');
            } else {
                alert(`Erro ao salvar configuração de storage: ${error.message || 'Erro desconhecido'}`);
            }
        }
    };
    
    const handleFormChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div>
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Armazenamento de Imagens</h2>
                    <p className="text-slate-500 mt-1">Configure um Supabase separado para armazenar as imagens do sistema.</p>
                </div>
                <button onClick={openModalForNew} className="flex items-center bg-primary-green text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:opacity-95">
                    <PlusIcon className="w-5 h-5 mr-2" /> Adicionar Storage
                </button>
            </div>

            {/* Notification */}
            {notification && (
                <div className={`mt-4 p-4 rounded-lg ${
                    notification.type === 'success' 
                        ? 'bg-green-50 border border-green-200 text-green-700'
                        : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                    <p className="text-sm font-medium">{notification.message}</p>
                </div>
            )}

            {/* Active Storage Indicator */}
            {activeConfig && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-blue-900">
                                Armazenamento Ativo: <span className="font-bold">{new URL(activeConfig.storage_url).hostname}</span>
                            </p>
                            <p className="text-sm text-blue-700">
                                Bucket: {activeConfig.bucket_name || 'Não especificado'} | Todas as novas imagens serão armazenadas neste local
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-6 space-y-4">
                {loading ? <p>Carregando...</p> : configs.map(config => (
                    <div 
                        key={config.id} 
                        className={`p-4 border rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                            config.is_active 
                                ? 'border-blue-300 bg-blue-50 shadow-sm' 
                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                        onClick={() => handleStorageConfigChange(config.id)}
                    >
                        <div className="flex items-center">
                             <input
                                type="radio"
                                name="active_storage_config"
                                id={`storage-config-${config.id}`}
                                checked={config.is_active}
                                onChange={() => handleStorageConfigChange(config.id)}
                                className="h-5 w-5 text-primary-blue focus:ring-primary-blue border-slate-300"
                            />
                            <label htmlFor={`storage-config-${config.id}`} className="ml-3 cursor-pointer">
                                <div className="flex items-center">
                                    <p className="font-bold text-slate-800">{new URL(config.storage_url).hostname}</p>
                                    {config.is_active && (
                                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Ativo
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-500">Bucket: {config.bucket_name || 'Não especificado'}</p>
                                {config.id === 'constantino-new' && (
                                    <p className="text-xs text-blue-600">Constantino Rezuski DB</p>
                                )}
                                {config.id === 'constantino' && (
                                    <p className="text-xs text-blue-600">Constantino Supabase</p>
                                )}
                                {config.id === 'default' && (
                                    <p className="text-xs text-slate-400">Supabase Principal</p>
                                )}
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button 
                                onClick={(e) => { e.stopPropagation(); testStorageConnection(config); }} 
                                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors" 
                                title="Testar conexão"
                            >
                                Testar
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); openModalForEdit(config); }} 
                                className="p-2 text-slate-500 hover:text-primary-blue rounded-md hover:bg-slate-100" 
                                title="Editar"
                            >
                                <EditIcon className="w-5 h-5"/>
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); deleteConfig(config.id); }} 
                                className="p-2 text-slate-500 hover:text-red-600 rounded-md hover:bg-slate-100" 
                                title="Excluir"
                            >
                                <TrashIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>
                ))}
                {!loading && configs.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                        <CloudIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Nenhuma configuração de storage encontrada.</p>
                        <p className="text-sm">Adicione uma configuração para usar um Supabase separado para imagens.</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                        <form onSubmit={handleSave}>
                            <header className="p-4 border-b border-slate-200 flex justify-between items-center">
                                <h3 className="text-lg font-bold">{editingConfig ? 'Editar' : 'Adicionar'} Configuração de Storage</h3>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700"><XIcon className="w-6 h-6"/></button>
                            </header>
                            <main className="p-6">
                                <StorageConfigForm
                                    config={formData}
                                    onConfigChange={handleFormChange}
                                    showApiKey={showApiKey}
                                    onToggleShowApiKey={() => setShowApiKey(prev => !prev)}
                                />
                            </main>
                            <footer className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-100">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-primary-green text-white font-semibold rounded-lg shadow-md hover:opacity-95">Salvar</button>
                            </footer>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};


const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { id: 'profile', name: 'Perfil', icon: <UserCircleIcon className="w-5 h-5 mr-2" /> },
        { id: 'notifications', name: 'Notificações', icon: <BellIcon className="w-5 h-5 mr-2" /> },
        { id: 'security', name: 'Segurança', icon: <ShieldIcon className="w-5 h-5 mr-2" /> },
        { id: 'storage', name: 'Armazenamento', icon: <CloudIcon className="w-5 h-5 mr-2" /> },
        { id: 'database', name: 'Banco de Dados', icon: <DatabaseIcon className="w-5 h-5 mr-2" /> },
        { id: 'ai', name: 'Inteligência Artificial', icon: <SparklesIcon className="w-5 h-5 mr-2" /> },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'profile': return <ProfileSettings />;
            case 'notifications': return <NotificationSettings />;
            case 'security': return <SecuritySettings />;
            case 'storage': return <StorageSettings />;
            case 'database': return <DatabaseSettings />;
            case 'ai': return <AISettings />;
            default: return <ProfileSettings />;
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Configurações</h1>
            <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/4">
                    <nav className="space-y-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-left ${
                                    activeTab === tab.id
                                        ? 'bg-primary-blue/20 text-primary-blue'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                {tab.icon}
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="w-full md:w-3/4">
                    <div className="bg-white p-8 rounded-lg shadow-sm">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;