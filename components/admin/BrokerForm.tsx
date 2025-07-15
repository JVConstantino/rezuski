
import React, { useState, useEffect } from 'react';
import { Broker } from '../../types';

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
    const [avatarFile, setAvatarFile] = useState<string>('');

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                title: initialData.title,
                phone: initialData.phone,
                email: initialData.email,
            });
            setAvatarPreview(initialData.avatarUrl);
            setAvatarFile(initialData.avatarUrl);
        }
    }, [initialData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
                setAvatarFile(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const brokerData = {
            ...formData,
            avatarUrl: avatarFile,
        };
        onSubmit(brokerData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <h3 className="text-lg font-medium text-slate-800">Foto de Perfil</h3>
                    <div className="mt-4">
                        <img 
                            src={avatarPreview || 'https://via.placeholder.com/150'} 
                            alt="Avatar Preview" 
                            className="w-40 h-40 rounded-full object-cover mx-auto"
                        />
                        <input 
                            type="file" 
                            onChange={handleImageChange} 
                            accept="image/*" 
                            className="mt-4 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-blue/10 file:text-primary-blue hover:file:bg-primary-blue/20"
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
                    <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-green hover:opacity-95">
                        {isEditing ? 'Salvar Alterações' : 'Adicionar Corretor'}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default BrokerForm;