


import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCategories } from '../../contexts/CategoryContext';
import CategoryForm from '../../components/admin/CategoryForm';
import { Category } from '../../types';
import { ChevronLeftIcon } from '../../components/Icons';

const EditCategoryPage: React.FC = () => {
    const { categoryId } = useParams<{ categoryId: string }>();
    const { categories, updateCategory } = useCategories();
    const navigate = useNavigate();

    const categoryToEdit = categories.find(c => c.id === categoryId);

    const handleSubmit = async (data: Omit<Category, 'id'>) => {
        if (categoryToEdit) {
            const updatedCategory = { ...categoryToEdit, ...data };
            await updateCategory(updatedCategory);
            navigate('/admin/categories');
        }
    };

    if (!categoryToEdit) {
        return <div className="text-center p-8">Categoria não encontrada.</div>;
    }

    return (
        <div>
            <Link to="/admin/categories" className="flex items-center text-sm text-slate-600 hover:text-indigo-600 font-semibold mb-2">
                <ChevronLeftIcon className="w-5 h-5 mr-1" />
                Voltar para Categorias
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Editar Categoria</h1>
            <CategoryForm initialData={categoryToEdit} onSubmit={handleSubmit} isEditing={true} />
        </div>
    );
};

export default EditCategoryPage;