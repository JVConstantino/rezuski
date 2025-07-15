
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProperties } from '../../contexts/PropertyContext';
import PropertyForm from '../../components/admin/PropertyForm';
import { Property, PropertyStatus, PriceHistoryEvent, PropertyPurpose, Amenity } from '../../types';
import { ChevronLeftIcon } from '../../components/Icons';

const AddPropertyPage: React.FC = () => {
    const { addProperty } = useProperties();
    const navigate = useNavigate();

    const handleSubmit = async (data: Omit<Property, 'id' | 'status' | 'priceHistory' | 'amenities' | 'listedByUserId'|'viewCount'> & { amenities: Amenity[] }) => {
        const newProperty: Property = {
            ...data,
            id: `prop-new-${data.code}-${Date.now()}`, // Supabase can auto-generate this, but for now we keep it
            status: PropertyStatus.AVAILABLE,
            listedByUserId: undefined, // Should be set to current user's ID
            viewCount: 0,
            priceHistory: [
                {
                    id: `ph-new-${data.code}-${Date.now()}`,
                    date: new Date().toISOString(),
                    price: data.purpose === PropertyPurpose.SALE ? data.salePrice || 0 : data.rentPrice || 0,
                    event: PriceHistoryEvent.LISTED,
                    source: 'Admin'
                }
            ],
        };
        await addProperty(newProperty);
        navigate('/admin/properties');
    };

    return (
        <div>
            <button onClick={() => navigate('/admin/properties')} className="flex items-center text-sm text-slate-600 hover:text-indigo-600 font-semibold mb-2">
                <ChevronLeftIcon className="w-5 h-5 mr-1" />
                Voltar para Propriedades
            </button>
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Adicionar Nova Propriedade</h1>
            <PropertyForm onSubmit={handleSubmit} isEditing={false} />
        </div>
    );
};

export default AddPropertyPage;
