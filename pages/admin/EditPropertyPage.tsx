import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProperties } from '../../contexts/PropertyContext';
import PropertyForm from '../../components/admin/PropertyForm';
import { Property, Amenity, PropertyStatus } from '../../types';
import { ChevronLeftIcon } from '../../components/Icons';

const EditPropertyPage: React.FC = () => {
    const { propertyId } = useParams<{ propertyId: string }>();
    const { properties, updateProperty } = useProperties();
    const navigate = useNavigate();

    const propertyToEdit = properties.find(p => p.id === propertyId);

    const handleSubmit = async (data: Omit<Property, 'id' | 'status' | 'priceHistory' | 'amenities'> & { amenities: Amenity[], translations: Property['translations'] }, status: PropertyStatus) => {
        if (propertyToEdit) {
            const updatedProperty = { ...propertyToEdit, ...data, status };
            await updateProperty(updatedProperty);
            navigate('/admin/properties');
        }
    };

    if (!propertyToEdit) {
        return <div className="text-center p-8">Imóvel não encontrado.</div>;
    }

    return (
        <div>
             <button onClick={() => navigate('/admin/properties')} className="flex items-center text-sm text-slate-600 hover:text-indigo-600 font-semibold mb-2">
                <ChevronLeftIcon className="w-5 h-5 mr-1" />
                Voltar para Propriedades
            </button>
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Editar Propriedade</h1>
            <PropertyForm initialData={propertyToEdit} onSubmit={handleSubmit} isEditing={true} />
        </div>
    );
};

export default EditPropertyPage;
