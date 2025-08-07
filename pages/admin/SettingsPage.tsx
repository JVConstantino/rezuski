import React, { useState, useEffect } from 'react';
import { UserCircleIcon, BellIcon, ShieldIcon, SparklesIcon, EyeIcon, EyeOffIcon, PlusIcon, EditIcon, TrashIcon, XIcon } from '../../components/Icons';
import { useAuth } from '../../contexts/AuthContext';
import { useAIConfig, AIConfig } from '../../contexts/AIConfigContext';

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


const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { id: 'profile', name: 'Perfil', icon: <UserCircleIcon className="w-5 h-5 mr-2" /> },
        { id: 'notifications', name: 'Notificações', icon: <BellIcon className="w-5 h-5 mr-2" /> },
        { id: 'security', name: 'Segurança', icon: <ShieldIcon className="w-5 h-5 mr-2" /> },
        { id: 'ai', name: 'Inteligência Artificial', icon: <SparklesIcon className="w-5 h-5 mr-2" /> },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'profile': return <ProfileSettings />;
            case 'notifications': return <NotificationSettings />;
            case 'security': return <SecuritySettings />;
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