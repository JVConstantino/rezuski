import React, { useState } from 'react';
import { UserCircleIcon, BellIcon, ShieldIcon } from '../../components/Icons';
import { useAuth } from '../../contexts/AuthContext';

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

const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { id: 'profile', name: 'Perfil', icon: <UserCircleIcon className="w-5 h-5 mr-2" /> },
        { id: 'notifications', name: 'Notificações', icon: <BellIcon className="w-5 h-5 mr-2" /> },
        { id: 'security', name: 'Segurança', icon: <ShieldIcon className="w-5 h-5 mr-2" /> },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'profile': return <ProfileSettings />;
            case 'notifications': return <NotificationSettings />;
            case 'security': return <SecuritySettings />;
            default: return <ProfileSettings />;
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Configurações</h1>
            <div className="flex">
                <div className="w-1/4">
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
                <div className="w-3/4 pl-8">
                    <div className="bg-white p-8 rounded-lg shadow-sm">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;