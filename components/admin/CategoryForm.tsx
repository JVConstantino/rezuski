import React, { useState, useEffect, useRef } from 'react';
import { Category } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import ImageGalleryModal from './ImageGalleryModal';
import { supabase } from '../../lib/supabaseClient';
import ImageWithFallback from '../ImageWithFallback';
import { BuildingIcon } from '../Icons';

interface CategoryFormProps {
    initialData?: Category;
    onSubmit: (data: Omit<Category, 'id'>) => void;
    isEditing: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ initialData, onSubmit, isEditing }) => {
    const { supportedLanguages } = useLanguage();
    const [name, setName] = useState('');
    const [iconUrl, setIconUrl] = useState('');
    const [translations, setTranslations] = useState<Category['translations']>({});
    const [isGalleryOpen, setGalleryOpen] = useState(false);
    const [activeLangTab, setActiveLangTab] = useState('pt-BR');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setIconUrl(initialData.iconUrl);
            setTranslations(initialData.translations || {});
        }
    }, [initialData]);

    const handleTranslationChange = (locale: string, value: string) => {
        setTranslations(prev => ({
            ...prev,
            [locale]: value,
        }));
    };

    const handleSelectIconFromGallery = (images: string[]) => {
        if (images.length > 0) {
            setIconUrl(images[0]);
        }
    };
    
    const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setIsUploading(true);
    
            const filePath = `public/category-icons/${Date.now()}-${file.name}`;
            
            try {
                const { error: uploadError } = await supabase.storage
                    .from('property-images')
                    .upload(filePath, file);
    
                if (uploadError) throw uploadError;
    
                const { data } = supabase.storage.from('property-images').getPublicUrl(filePath);
                setIconUrl(data.publicUrl);
            } catch (error) {
                console.error('Error uploading icon:', error);
                alert('Erro ao enviar ícone.');
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ name, iconUrl, translations });
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-sm max-w-2xl">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Ícone</label>
                    <div className="mt-2 flex items-center space-x-4">
                        <div className="relative w-20 h-20 rounded-md bg-slate-100 p-1 flex items-center justify-center border">
                            {iconUrl ? (
                                <ImageWithFallback 
                                    src={iconUrl} 
                                    alt="Preview do ícone" 
                                    className="w-20 h-20 object-contain rounded border"
                                    categoryName={name}
                                />
                            ) : (
                                <span className="text-xs text-slate-500">Sem Ícone</span>
                            )}
                            {isUploading && <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-md"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-blue"></div></div>}
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                type="button"
                                onClick={() => setGalleryOpen(true)}
                                className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                Galeria
                            </button>
                             <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50"
                                disabled={isUploading}
                            >
                                {isUploading ? 'Enviando...' : 'Enviar'}
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleIconUpload} className="hidden" accept="image/*,.svg" />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nome da Categoria e Traduções</label>
                    <div className="border-b border-slate-200">
                        <nav className="-mb-px flex space-x-6">
                            {supportedLanguages.map(lang => (
                                <button
                                    key={lang.code}
                                    type="button"
                                    onClick={() => setActiveLangTab(lang.code)}
                                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeLangTab === lang.code
                                        ? 'border-primary-blue text-primary-blue'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                    }`}
                                >
                                    {lang.flag} {lang.name}
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div className="mt-4">
                        {activeLangTab === 'pt-BR' ? (
                             <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm" />
                        ) : (
                             <input type="text" value={translations?.[activeLangTab] || ''} onChange={e => handleTranslationChange(activeLangTab, e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm" />
                        )}
                    </div>
                </div>

                <div className="pt-5">
                    <div className="flex justify-end">
                        <button type="button" onClick={() => window.history.back()} className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50">Cancelar</button>
                        <button type="submit" disabled={isUploading} className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-green hover:opacity-95">
                            {isEditing ? 'Salvar Alterações' : 'Adicionar Categoria'}
                        </button>
                    </div>
                </div>
            </form>

            <ImageGalleryModal
                isOpen={isGalleryOpen}
                onClose={() => setGalleryOpen(false)}
                onSelectImages={handleSelectIconFromGallery}
                selectionMode="single"
                currentImages={[]}
            />
        </>
    );
};

export default CategoryForm;