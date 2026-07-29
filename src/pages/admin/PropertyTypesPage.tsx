import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePropertyTypes } from '../../contexts/PropertyTypeContext';
import { useAIConfig } from '../../contexts/AIConfigContext';
import { ManagedPropertyType } from '../../types';
import { PlusIcon, EditIcon, TrashIcon, CheckCircleIcon, XIcon, SparklesIcon } from '../../components/Icons';

const PropertyTypesPage: React.FC = () => {
    const { propertyTypes, addPropertyType, updatePropertyType, deletePropertyType, loading, translateAllPropertyTypesWithAI } = usePropertyTypes();
    const { activeConfig, loading: aiConfigLoading } = useAIConfig();
    const [newPropertyTypeName, setNewPropertyTypeName] = useState('');
    const [editingPropertyTypeId, setEditingPropertyTypeId] = useState<string | null>(null);
    const [editingPropertyTypeName, setEditingPropertyTypeName] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);
    const navigate = useNavigate();

    const handleAddPropertyType = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPropertyTypeName.trim()) {
            await addPropertyType(newPropertyTypeName.trim());
            setNewPropertyTypeName('');
        }
    };

    const handleDelete = (id: string, name: string) => {
        if (window.confirm(`Tem certeza que deseja remover o tipo de imóvel "${name}"?`)) {
            deletePropertyType(id);
        }
    };

    const handleEditStart = (propertyType: ManagedPropertyType) => {
        setEditingPropertyTypeId(propertyType.id);
        setEditingPropertyTypeName(propertyType.name);
    };

    const handleEditCancel = () => {
        setEditingPropertyTypeId(null);
        setEditingPropertyTypeName('');
    };

    const handleEditSave = async () => {
        if (editingPropertyTypeId && editingPropertyTypeName.trim()) {
            await updatePropertyType(editingPropertyTypeId, editingPropertyTypeName.trim());
            handleEditCancel();
        }
    };

    const handleTranslateAll = async () => {
        if (aiConfigLoading) {
            alert('Carregando configurações de IA, por favor aguarde.');
            return;
        }
        if (!activeConfig?.api_key || !activeConfig?.model) {
            alert('Nenhum provedor de IA ativo foi configurado. Por favor, configure e ative um provedor no painel de Configurações.');
            navigate('/admin/settings');
            return;
        }
        setIsTranslating(true);
        await translateAllPropertyTypesWithAI(activeConfig);
        setIsTranslating(false);
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-slate-900">Gerenciar Tipos de Imóvel</h1>
                <button
                    onClick={handleTranslateAll}
                    disabled={isTranslating || loading || aiConfigLoading}
                    className="flex items-center bg-secondary-blue text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:opacity-95 transition-all duration-200 disabled:opacity-50"
                >
                    <SparklesIcon className={`w-5 h-5 mr-2 ${isTranslating ? 'animate-spin' : ''}`} />
                    {isTranslating ? 'Traduzindo...' : 'Traduzir Tudo com IA'}
                </button>
            </div>


            <div className="bg-white p-6 rounded-lg shadow-sm">
                <form onSubmit={handleAddPropertyType} className="flex items-center space-x-3 mb-6 pb-6 border-b border-slate-200">
                    <input
                        type="text"
                        value={newPropertyTypeName}
                        onChange={(e) => setNewPropertyTypeName(e.target.value)}
                        placeholder="Nome do novo tipo de imóvel"
                        className="flex-grow px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"
                    />
                    <button type="submit" className="flex items-center bg-primary-green text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:opacity-95">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Adicionar
                    </button>
                </form>

                {loading && !isTranslating ? (
                     <div className="text-center py-10 text-slate-500">
                        <p>Carregando tipos de imóvel...</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {propertyTypes.map(propertyType => (
                            <div key={propertyType.id} className="p-3 flex items-center justify-between bg-slate-50 rounded-md border border-slate-200">
                                {editingPropertyTypeId === propertyType.id ? (
                                    <input
                                        type="text"
                                        value={editingPropertyTypeName}
                                        onChange={(e) => setEditingPropertyTypeName(e.target.value)}
                                        className="flex-grow px-2 py-1 border border-primary-blue rounded-md sm:text-sm"
                                        autoFocus
                                    />
                                ) : (
                                    <p className="font-medium text-slate-800">{propertyType.name}</p>
                                )}

                                <div className="flex space-x-2">
                                    {editingPropertyTypeId === propertyType.id ? (
                                        <>
                                            <button onClick={handleEditSave} className="p-2 text-green-600 hover:bg-green-100 rounded-md" title="Salvar">
                                                <CheckCircleIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={handleEditCancel} className="p-2 text-slate-500 hover:bg-slate-200 rounded-md" title="Cancelar">
                                                <XIcon className="w-5 h-5" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => handleEditStart(propertyType)} className="p-2 text-slate-500 hover:text-primary-blue rounded-md hover:bg-slate-100" title="Editar">
                                                <EditIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleDelete(propertyType.id, propertyType.name)} className="p-2 text-slate-500 hover:text-red-600 rounded-md hover:bg-slate-100" title="Remover">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                         {propertyTypes.length === 0 && (
                            <div className="text-center py-10 text-slate-500">
                                <p>Nenhum tipo de imóvel encontrado.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PropertyTypesPage;
