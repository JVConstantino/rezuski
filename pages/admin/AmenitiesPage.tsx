import React, { useState } from 'react';
import { useAmenities } from '../../contexts/AmenityContext';
import { ManagedAmenity } from '../../types';
import { PlusIcon, EditIcon, TrashIcon, CheckCircleIcon, XIcon } from '../../components/Icons';

const AmenitiesPage: React.FC = () => {
    const { amenities, addAmenity, updateAmenity, deleteAmenity, loading } = useAmenities();
    const [newAmenityName, setNewAmenityName] = useState('');
    const [editingAmenityId, setEditingAmenityId] = useState<string | null>(null);
    const [editingAmenityName, setEditingAmenityName] = useState('');

    const handleAddAmenity = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newAmenityName.trim()) {
            await addAmenity(newAmenityName.trim());
            setNewAmenityName('');
        }
    };

    const handleDelete = (id: string, name: string) => {
        if (window.confirm(`Tem certeza que deseja remover a comodidade "${name}"?`)) {
            deleteAmenity(id);
        }
    };

    const handleEditStart = (amenity: ManagedAmenity) => {
        setEditingAmenityId(amenity.id);
        setEditingAmenityName(amenity.name);
    };

    const handleEditCancel = () => {
        setEditingAmenityId(null);
        setEditingAmenityName('');
    };

    const handleEditSave = async () => {
        if (editingAmenityId && editingAmenityName.trim()) {
            await updateAmenity(editingAmenityId, editingAmenityName.trim());
            handleEditCancel();
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Gerenciar Comodidades</h1>

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <form onSubmit={handleAddAmenity} className="flex items-center space-x-3 mb-6 pb-6 border-b border-slate-200">
                    <input
                        type="text"
                        value={newAmenityName}
                        onChange={(e) => setNewAmenityName(e.target.value)}
                        placeholder="Nome da nova comodidade"
                        className="flex-grow px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"
                    />
                    <button type="submit" className="flex items-center bg-primary-green text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:opacity-95">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Adicionar
                    </button>
                </form>

                {loading ? (
                     <div className="text-center py-10 text-slate-500">
                        <p>Carregando comodidades...</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {amenities.map(amenity => (
                            <div key={amenity.id} className="p-3 flex items-center justify-between bg-slate-50 rounded-md border border-slate-200">
                                {editingAmenityId === amenity.id ? (
                                    <input
                                        type="text"
                                        value={editingAmenityName}
                                        onChange={(e) => setEditingAmenityName(e.target.value)}
                                        className="flex-grow px-2 py-1 border border-primary-blue rounded-md sm:text-sm"
                                        autoFocus
                                    />
                                ) : (
                                    <p className="font-medium text-slate-800">{amenity.name}</p>
                                )}
                                
                                <div className="flex space-x-2">
                                    {editingAmenityId === amenity.id ? (
                                        <>
                                            <button onClick={handleEditSave} className="p-2 text-green-600 hover:bg-green-100 rounded-md" title="Salvar">
                                                <CheckCircleIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={handleEditCancel} className="p-2 text-slate-500 hover:bg-slate-200 rounded-md" title="Cancelar">
                                                <XIcon className="w-5 h-5" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => handleEditStart(amenity)} className="p-2 text-slate-500 hover:text-primary-blue rounded-md hover:bg-slate-100" title="Editar">
                                                <EditIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleDelete(amenity.id, amenity.name)} className="p-2 text-slate-500 hover:text-red-600 rounded-md hover:bg-slate-100" title="Remover">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                         {amenities.length === 0 && (
                            <div className="text-center py-10 text-slate-500">
                                <p>Nenhuma comodidade encontrada.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AmenitiesPage;
