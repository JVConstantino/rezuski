import React, { useState, useEffect, useRef } from 'react';
import { Broker } from '../../types';
import ImageGalleryModal from './ImageGalleryModal';
import { supabase } from '../../lib/supabaseClient';

interface BrokerFormProps {
    initialData?: Broker;
    onSubmit: (data: Omit<Broker, 'id'>) => void;
    isEditing: boolean;
}

const BrokerForm: React.FC<BrokerFormProps> = ({ initialData, onSubmit, isEditing }) => {
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        phone: '',
        email: '',
        avatarUrl: '',
    });
    const [isGalleryOpen, setGalleryOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                title: initialData.title,
                phone: initialData.phone,
                email: initialData.email,
                avatarUrl: initialData.avatarUrl,
            });
        }
    }, [initialData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectAvatarFromGallery = (images: string[]) => {
        if (images.length > 0) {
            setFormData(prev => ({ ...prev, avatarUrl: images[0] }));
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setIsUploading(true);
    
            const filePath = `public/avatars/${Date.now()}-${file.name}`;
            
            try {
                const { error: uploadError } = await supabase.storage
                    .from('property-images')
                    .upload(filePath, file);
    
                if (uploadError) throw uploadError;
    
                const { data } = supabase.storage.from('property-images').getPublicUrl(filePath);
                setFormData(prev => ({ ...prev, avatarUrl: data.publicUrl }));
            } catch (error) {
                console.error('Error uploading avatar:', error);
                alert('Erro ao enviar avatar.');
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.avatarUrl) {
            alert('Por favor, selecione uma imagem de perfil da galeria.');
            return;
        }
        onSubmit(formData);
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                        <h3 className="text-lg font-medium text-slate-800">Foto de Perfil</h3>
                        <div className="mt-4">
                            <div className="relative w-40 h-40 mx-auto">
                                <img
                                    src={formData.avatarUrl || 'https://via.placeholder.com/150'}
                                    alt="Avatar Preview"
                                    className="w-40 h-40 rounded-full object-cover border"
                                />
                                {isUploading && <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div></div>}
                            </div>
                            <div className="mt-4 flex items-center space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setGalleryOpen(true)}
                                    className="flex-1 bg-white py-2 px-3 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Galeria
                                </button>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex-1 bg-white py-2 px-3 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50"
                                    disabled={isUploading}
                                >
                                    {isUploading ? 'Enviando...' : 'Enviar'}
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                            </div>
                        </div>
                    </div>
                    <div className="md:col-span-2 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Nome Completo</label>
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Cargo</label>
                            <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Telefone</label>
                            <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm" />
                        </div>
                    </div>
                </div>
                <div className="pt-5">
                    <div className="flex justify-end">
                        <button type="button" onClick={() => window.history.back()} className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50">Cancelar</button>
                        <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-green hover:opacity-95">
                            {isEditing ? 'Salvar Alterações' : 'Adicionar Corretor'}
                        </button>
                    </div>
                </div>
            </form>
            <ImageGalleryModal
                isOpen={isGalleryOpen}
                onClose={() => setGalleryOpen(false)}
                onSelectImages={handleSelectAvatarFromGallery}
                selectionMode="single"
                currentImages={formData.avatarUrl ? [formData.avatarUrl] : []}
            />
        </>
    );
};

export default BrokerForm;