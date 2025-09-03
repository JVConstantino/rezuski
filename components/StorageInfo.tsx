import React from 'react';
import { useStorageConfig } from '../contexts/StorageConfigContext';

const StorageInfo: React.FC = () => {
    const { activeConfig, configs, loading } = useStorageConfig();

    if (loading) {
        return <div className="text-sm text-slate-500">Carregando configuração de storage...</div>;
    }

    if (!activeConfig) {
        return <div className="text-sm text-red-500">Nenhuma configuração de storage ativa</div>;
    }

    return (
        <div className="text-sm">
            <p className="text-slate-700">
                <span className="font-medium">Storage Ativo:</span> {new URL(activeConfig.storage_url).hostname}
            </p>
            <p className="text-slate-500">
                Bucket: {activeConfig.bucket_name} | Configs Disponíveis: {configs.length}
            </p>
        </div>
    );
};

export default StorageInfo;