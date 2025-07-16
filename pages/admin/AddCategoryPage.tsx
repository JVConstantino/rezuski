

import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useCategories } from '../../contexts/CategoryContext';
import CategoryForm from '../../components/admin/CategoryForm';
import { Category } from '../../types';
import { ChevronLeftIcon } from '../../components/Icons';

const AddCategoryPage: React.FC = () => {
    const { addCategory } = useCategories();
    const navigate = ReactRouterDOM.useNavigate();

    const handleSubmit = async (data: Omit<Category, 'id'>) => {
        await addCategory(data);
        navigate('/admin/categories');
    };

    return (
        <div>
            <ReactRouterDOM.Link to="/admin/categories" className="flex items-center text-sm text-slate-600 hover:text-indigo-600 font-semibold mb-2">
                <ChevronLeftIcon className="w-5 h-5 mr-1" />
                Voltar para Categorias
            </ReactRouterDOM.Link>
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Adicionar Nova Categoria</h1>
            <CategoryForm onSubmit={handleSubmit} isEditing={false} />
        </div>
    );
};

export default AddCategoryPage;