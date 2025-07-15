import React, { useState, useEffect } from 'react';
import { Category } from '../../types';

interface CategoryFormProps {
    initialData?: Category;
    onSubmit: (data: Omit<Category, 'id'>) => void;
    isEditing: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ initialData, onSubmit, isEditing }) => {
    const [formData, setFormData] = useState({
        name: '',
        iconUrl: '',
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                iconUrl: initialData.iconUrl,
            });
        }
    }, [initialData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({...prev, iconUrl: reader.result as string}));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-sm max-w-lg">
            <div>
                <label className="block text-sm font-medium text-slate-700">Nome da Categoria</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm" />
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-700">Ícone</label>
                <div className="mt-2 flex items-center space-x-4">
                    {formData.iconUrl && (
                        <img src={formData.iconUrl} alt="Preview" className="h-16 w-16 object-contain rounded-md bg-slate-100 p-1" />
                    )}
                    <input 
                        type="file" 
                        onChange={handleIconChange} 
                        accept="image/*" 
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-blue/10 file:text-primary-blue hover:file:bg-primary-blue/20"
                    />
                </div>
                <p className="mt-2 text-xs text-slate-500">Faça o upload de uma imagem para o ícone da categoria.</p>
            </div>
            <div className="pt-5">
                <div className="flex justify-end">
                    <button type="button" onClick={() => window.history.back()} className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50">Cancelar</button>
                    <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-green hover:opacity-95">
                        {isEditing ? 'Salvar Alterações' : 'Adicionar Categoria'}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default CategoryForm;