
import React, { useState, useEffect } from 'react';
import { Broker } from '../../types';
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
    });
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                title: initialData.title,
                phone: initialData.phone,
                email: initialData.email,
            });
            setAvatarPreview(initialData.avatarUrl);
            setAvatarUrl(initialData.avatarUrl);
        }
    }, [initialData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Show local preview immediately
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            
            setIsUploading(true);

            const filePath = `public/avatars/${Date.now()}-${file.name}`;
            try {
                const { error: uploadError } = await supabase.storage
                    .from('property-images')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage.from('property-images').getPublicUrl(filePath);
                setAvatarUrl(data.publicUrl);

            } catch (error) {
                console.error('Error uploading avatar:', error);
                alert('Erro ao enviar a imagem do avatar.');
                setAvatarPreview(initialData?.avatarUrl || null); // Revert preview on error
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!avatarUrl) {
            alert('Por favor, aguarde o upload da imagem do avatar ou selecione uma imagem.');
            return;
        }
        const brokerData = {
            ...formData,
            avatarUrl: avatarUrl,
        };
        onSubmit(brokerData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <h3 className="text-lg font-medium text-slate-800">Foto de Perfil</h3>
                    <div className="mt-4">
                        <div className="relative w-40 h-40 mx-auto">
                            <img 
                                src={avatarPreview || 'https://via.placeholder.com/150'} 
                                alt="Avatar Preview" 
                                className="w-40 h-40 rounded-full object-cover"
                            />
                            {isUploading && (
                                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                </div>
                            )}
                        </div>
                        <input 
                            type="file" 
                            onChange={handleImageChange} 
                            accept="image/*" 
                            disabled={isUploading}
                            className="mt-4 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-blue/10 file:text-primary-blue hover:file:bg-primary-blue/20 disabled:opacity-50"
                        />
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
                    <button type="submit" disabled={isUploading} className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-green hover:opacity-95 disabled:opacity-50">
                        {isUploading ? 'Enviando...' : (isEditing ? 'Salvar Alterações' : 'Adicionar Corretor')}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default BrokerForm;
