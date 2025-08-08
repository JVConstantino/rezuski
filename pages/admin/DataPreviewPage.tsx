import React, { useState } from 'react';

// Import all context hooks
import { useProperties } from '../../contexts/PropertyContext';
import { useUsers } from '../../contexts/UserContext';
import { useTenants } from '../../contexts/TenantContext';
import { useApplications } from '../../contexts/ApplicationContext';
import { useBrokers } from '../../contexts/BrokerContext';
import { useCategories } from '../../contexts/CategoryContext';
import { useAmenities } from '../../contexts/AmenityContext';
import { useResources } from '../../contexts/ResourceContext';
import { useAIConfig } from '../../contexts/AIConfigContext';

// Reusable component to display data
const DataViewer: React.FC<{ data: any; loading: boolean; error?: string }> = ({ data, loading, error }) => {
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
            </div>
        );
    }

    if (error) {
        return <div className="bg-red-100 text-red-800 p-4 rounded-lg">{error}</div>;
    }

    return (
        <pre className="bg-slate-800 text-green-300 p-4 rounded-lg text-xs overflow-auto max-h-[60vh] font-mono">
            {JSON.stringify(data, null, 2)}
        </pre>
    );
};

const DataPreviewPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('properties');

    const dataSources: Record<string, { data: any[], loading: boolean }> = {
        properties: { data: useProperties().properties, loading: useProperties().loading },
        users: { data: useUsers().users, loading: useUsers().loading },
        tenants: { data: useTenants().tenants, loading: useTenants().loading },
        applications: { data: useApplications().applications, loading: useApplications().loading },
        brokers: { data: useBrokers().brokers, loading: useBrokers().loading },
        categories: { data: useCategories().categories, loading: useCategories().loading },
        amenities: { data: useAmenities().amenities, loading: useAmenities().loading },
        resources: { data: useResources().resources, loading: useResources().loading },
        ai_configs: { data: useAIConfig().configs, loading: useAIConfig().loading },
    };

    const tabs = [
        { id: 'properties', label: 'Imóveis' },
        { id: 'users', label: 'Usuários' },
        { id: 'tenants', label: 'Inquilinos' },
        { id: 'applications', label: 'Aplicações' },
        { id: 'brokers', label: 'Corretores' },
        { id: 'categories', label: 'Categorias' },
        { id: 'amenities', label: 'Comodidades' },
        { id: 'resources', label: 'Recursos' },
        { id: 'ai_configs', label: 'Config. IA' },
    ];

    const renderContent = () => {
        const source = dataSources[activeTab];
        if (!source) return null;
        return <DataViewer data={source.data} loading={source.loading} />;
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900">Pré-visualização de Dados</h1>
            <p className="mt-2 text-slate-600">
                Esta seção exibe os dados brutos de várias tabelas do seu banco de dados. É uma ferramenta útil para depuração e para ter uma visão geral de todo o conteúdo salvo no site.
            </p>

            <div className="mt-6 border-b border-slate-200">
                <nav className="-mb-px flex space-x-6 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === tab.id
                                    ? 'border-primary-blue text-primary-blue'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                        >
                            {tab.label}
                            {!dataSources[tab.id].loading && (
                                <span className="ml-2 bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                    {dataSources[tab.id].data.length}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="mt-6">
                {renderContent()}
            </div>
        </div>
    );
};

export default DataPreviewPage;