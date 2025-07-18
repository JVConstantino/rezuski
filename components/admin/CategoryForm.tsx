
import React, { useState, useEffect } from 'react';
import { Category } from '../../types';
import ImageGalleryModal from './ImageGalleryModal';

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
    const [isGalleryOpen, setGalleryOpen] = useState(false);

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

    const handleSelectIconFromGallery = (imageUrl: string) => {
        setFormData(prev => ({ ...prev, iconUrl: imageUrl }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-sm max-w-lg">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Nome da Categoria</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Ícone</label>
                    <div className="mt-2 flex items-center space-x-4">
                        <div className="w-20 h-20 rounded-md bg-slate-100 p-1 flex items-center justify-center border">
                            {formData.iconUrl ? (
                                <img src={formData.iconUrl} alt="Preview" className="h-full w-full object-contain" />
                            ) : (
                                <span className="text-xs text-slate-500">Sem Ícone</span>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => setGalleryOpen(true)}
                            className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Selecionar da Galeria
                        </button>
                    </div>
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

            <ImageGalleryModal
                isOpen={isGalleryOpen}
                onClose={() => setGalleryOpen(false)}
                onSelectSingleImage={handleSelectIconFromGallery}
                selectionMode="single"
                currentImages={[]}
            />
        </>
    );
};

export default CategoryForm;
