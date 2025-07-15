import React from 'react';
import { Link } from 'react-router-dom';
import { useCategories } from '../../contexts/CategoryContext';
import { PlusIcon, EditIcon, TrashIcon } from '../../components/Icons';

const CategoriesPage: React.FC = () => {
    const { categories, deleteCategory } = useCategories();

    const handleDelete = (id: string) => {
        if (window.confirm('Tem certeza que deseja remover esta categoria?')) {
            deleteCategory(id);
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-900">Gerenciar Categorias</h1>
                <Link to="/admin/categories/new" className="flex items-center bg-primary-green text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:opacity-95 transition-all duration-200">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Adicionar Categoria
                </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="p-4 font-semibold text-slate-600">Ícone</th>
                                <th className="p-4 font-semibold text-slate-600">Nome</th>
                                <th className="p-4 font-semibold text-slate-600 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map(category => (
                                <tr key={category.id} className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="p-4">
                                        <img src={category.iconUrl} alt={category.name} className="w-10 h-10 object-contain" />
                                    </td>
                                    <td className="p-4">
                                        <p className="font-semibold text-slate-800">{category.name}</p>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-center space-x-2">
                                            <Link to={`/admin/categories/edit/${category.id}`} className="p-2 text-slate-500 hover:text-primary-blue rounded-md hover:bg-slate-100" title="Editar">
                                                <EditIcon className="w-5 h-5" />
                                            </Link>
                                            <button onClick={() => handleDelete(category.id)} className="p-2 text-slate-500 hover:text-red-600 rounded-md hover:bg-slate-100" title="Remover">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CategoriesPage;