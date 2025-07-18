
import React, { useState, useEffect } from 'react';
import { Broker } from '../../types';
import ImageGalleryModal from './ImageGalleryModal';

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
    });
    const [avatarUrl, setAvatarUrl] = useState<string>('');
    const [isGalleryOpen, setGalleryOpen] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                title: initialData.title,
                phone: initialData.phone,
                email: initialData.email,
            });
            setAvatarUrl(initialData.avatarUrl);
        }
    }, [initialData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectAvatarFromGallery = (imageUrl: string) => {
        setAvatarUrl(imageUrl);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!avatarUrl) {
            alert('Por favor, selecione uma imagem de perfil da galeria.');
            return;
        }
        const brokerData = {
            ...formData,
            avatarUrl,
        };
        onSubmit(brokerData);
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
                                    src={avatarUrl || 'https://via.placeholder.com/150'}
                                    alt="Avatar Preview"
                                    className="w-40 h-40 rounded-full object-cover border"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => setGalleryOpen(true)}
                                className="mt-4 w-full bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                Selecionar da Galeria
                            </button>
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
                onSelectSingleImage={handleSelectAvatarFromGallery}
                selectionMode="single"
                currentImages={[]}
            />
        </>
    );
};

export default BrokerForm;
