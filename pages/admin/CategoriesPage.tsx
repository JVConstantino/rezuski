import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCategories } from '../../contexts/CategoryContext';
import { useDatabaseConfig } from '../../contexts/DatabaseConfigContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAIConfig } from '../../contexts/AIConfigContext';
import { PlusIcon, EditIcon, TrashIcon, SparklesIcon, GripVerticalIcon } from '../../components/Icons';
import ImageWithFallback from '../../components/ImageWithFallback';

const CategoriesPage: React.FC = () => {
    const { categories, deleteCategory, translateAllCategoriesWithAI, loading } = useCategories();
    const { setCategoryOrder } = useDatabaseConfig();
    const { t } = useLanguage();
    const { activeConfig, loading: aiConfigLoading } = useAIConfig();
    const [isTranslating, setIsTranslating] = useState(false);
    const [draggedItem, setDraggedItem] = useState<string | null>(null);
    const [dragOverItem, setDragOverItem] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleDelete = (id: string, name: string) => {
        if (window.confirm(`Tem certeza que deseja remover a categoria "${name}"?`)) {
            deleteCategory(id);
        }
    }

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
        await translateAllCategoriesWithAI(activeConfig);
        setIsTranslating(false);
    };

    const handleDragStart = (e: React.DragEvent, categoryId: string) => {
        setDraggedItem(categoryId);
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.style.opacity = '0.5';
    };

    const handleDragOver = (e: React.DragEvent, categoryId: string) => {
        e.preventDefault();
        setDragOverItem(categoryId);
        e.currentTarget.style.background = '#f0f9ff';
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.currentTarget.style.background = '';
        setDragOverItem(null);
    };

    const handleDrop = async (e: React.DragEvent, targetCategoryId: string) => {
        e.preventDefault();
        e.currentTarget.style.background = '';
        e.currentTarget.style.opacity = '1';
        
        if (!draggedItem || draggedItem === targetCategoryId) {
            setDraggedItem(null);
            setDragOverItem(null);
            return;
        }

        // Reordenar as categorias
        const draggedIndex = categories.findIndex(cat => cat.id === draggedItem);
        const targetIndex = categories.findIndex(cat => cat.id === targetCategoryId);
        
        if (draggedIndex === -1 || targetIndex === -1) return;

        const newCategories = [...categories];
        const [draggedCategory] = newCategories.splice(draggedIndex, 1);
        newCategories.splice(targetIndex, 0, draggedCategory);

        // Criar string de ordem das categorias
        const categoryOrder = newCategories.map(cat => cat.id).join(',');
        
        try {
            await setCategoryOrder(categoryOrder);
            console.log('Ordem das categorias salva:', categoryOrder);
        } catch (error) {
            console.error('Erro ao salvar ordem das categorias:', error);
            alert('Erro ao salvar a nova ordem das categorias.');
        }

        setDraggedItem(null);
        setDragOverItem(null);
    };

    const handleDragEnd = (e: React.DragEvent) => {
        e.currentTarget.style.opacity = '1';
        e.currentTarget.style.background = '';
        setDraggedItem(null);
        setDragOverItem(null);
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Gerenciar Categorias</h1>
                    <p className="text-sm text-slate-600 mt-1">Arraste e solte para reordenar as categorias</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleTranslateAll}
                        disabled={isTranslating || loading || aiConfigLoading}
                        className="flex items-center bg-secondary-blue text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:opacity-95 transition-all duration-200 disabled:opacity-50"
                    >
                        <SparklesIcon className={`w-5 h-5 mr-2 ${isTranslating ? 'animate-spin' : ''}`} />
                        {isTranslating ? 'Traduzindo...' : 'Traduzir Tudo com IA'}
                    </button>
                    <Link to="/admin/categories/new" className="flex items-center bg-primary-green text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:opacity-95 transition-all duration-200">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Adicionar Categoria
                    </Link>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
                {/* Mobile View */}
                <div className="md:hidden space-y-3">
                    {categories.map(category => (
                        <div 
                            key={category.id} 
                            draggable
                            onDragStart={(e) => handleDragStart(e, category.id)}
                            onDragOver={(e) => handleDragOver(e, category.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, category.id)}
                            onDragEnd={handleDragEnd}
                            className={`bg-white p-4 rounded-lg shadow-sm border flex items-center justify-between cursor-move transition-all ${
                                dragOverItem === category.id ? 'border-primary-blue bg-blue-50' : 'hover:shadow-md'
                            }`}
                        >
                            <div className="flex items-center space-x-4">
                                <GripVerticalIcon className="w-5 h-5 text-slate-400" />
                                <ImageWithFallback 
                                    src={category.iconUrl} 
                                    alt={category.name} 
                                    className="w-10 h-10 object-contain rounded" 
                                    categoryName={category.name}
                                />
                                <p className="font-semibold text-slate-800">{t(`category:${category.id}`)}</p>
                            </div>
                            <div className="flex space-x-1">
                                <Link to={`/admin/categories/edit/${category.id}`} className="p-2 text-slate-500 hover:text-primary-blue rounded-md hover:bg-slate-100" title="Editar">
                                    <EditIcon className="w-5 h-5" />
                                </Link>
                                <button onClick={() => handleDelete(category.id, category.name)} className="p-2 text-slate-500 hover:text-red-600 rounded-md hover:bg-slate-100" title="Remover">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="p-4 font-semibold text-slate-600 w-12"></th>
                                <th className="p-4 font-semibold text-slate-600">Ícone</th>
                                <th className="p-4 font-semibold text-slate-600">Nome</th>
                                <th className="p-4 font-semibold text-slate-600 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map(category => (
                                <tr 
                                    key={category.id} 
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, category.id)}
                                    onDragOver={(e) => handleDragOver(e, category.id)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, category.id)}
                                    onDragEnd={handleDragEnd}
                                    className={`border-b border-slate-200 cursor-move transition-all ${
                                        dragOverItem === category.id ? 'bg-blue-50 border-primary-blue' : 'hover:bg-slate-50'
                                    }`}
                                >
                                    <td className="p-4 text-center">
                                        <GripVerticalIcon className="w-5 h-5 text-slate-400 mx-auto" />
                                    </td>
                                    <td className="p-4">
                                        <ImageWithFallback 
                                            src={category.iconUrl} 
                                            alt={category.name} 
                                            className="w-10 h-10 object-contain rounded" 
                                            categoryName={category.name}
                                        />
                                    </td>
                                    <td className="p-4">
                                        <p className="font-semibold text-slate-800">{t(`category:${category.id}`)}</p>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-center space-x-2">
                                            <Link to={`/admin/categories/edit/${category.id}`} className="p-2 text-slate-500 hover:text-primary-blue rounded-md hover:bg-slate-100" title="Editar">
                                                <EditIcon className="w-5 h-5" />
                                            </Link>
                                            <button onClick={() => handleDelete(category.id, category.name)} className="p-2 text-slate-500 hover:text-red-600 rounded-md hover:bg-slate-100" title="Remover">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {categories.length === 0 && (
                    <div className="text-center py-10 text-slate-500">
                        <p>Nenhuma categoria encontrada.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoriesPage;