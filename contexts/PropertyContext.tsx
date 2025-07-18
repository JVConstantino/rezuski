
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Property, PropertyStatus, Amenity, PriceHistory } from '../types';
import { supabase } from '../lib/supabaseClient';
import { Database } from '../types/supabase';

interface PropertyContextType {
    properties: Property[];
    addProperty: (property: Omit<Property, 'id'>) => Promise<void>;
    updateProperty: (updatedProperty: Property) => Promise<void>;
    toggleArchiveProperty: (propertyId: string) => Promise<void>;
    deleteProperty: (propertyId: string) => Promise<void>;
    loading: boolean;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProperties = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .order('createdAt', { ascending: false });

        if (error) {
            console.error('Error fetching properties:', error);
            setProperties([]);
        } else {
            setProperties(data as unknown as Property[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    const addProperty = async (property: Omit<Property, 'id'>) => {
        const insertPayload: Database['public']['Tables']['properties']['Insert'] = {
            ...property,
            amenities: property.amenities as any,
            priceHistory: property.priceHistory as any,
        };
        const { data, error } = await supabase
            .from('properties')
            .insert([insertPayload])
            .select();
        
        if (error) {
            console.error('Error adding property:', error.message);
            alert(`Error adding property: ${error.message}`);
        } else if (data) {
            setProperties(prev => [data[0] as unknown as Property, ...prev]);
        }
    };

    const updateProperty = async (updatedProperty: Property) => {
        const { id, ...updateData } = updatedProperty;
        const payload: Database['public']['Tables']['properties']['Update'] = {
            ...updateData,
            amenities: updateData.amenities as any,
            priceHistory: updateData.priceHistory as any,
        };

        const { data, error } = await supabase
            .from('properties')
            .update(payload)
            .eq('id', id)
            .select();

        if (error) {
            console.error('Error updating property:', error.message);
            alert(`Error updating property: ${error.message}`);
        } else if (data) {
             setProperties(prev => prev.map(p => p.id === updatedProperty.id ? (data[0] as unknown as Property) : p));
        }
    };
    
    const toggleArchiveProperty = async (propertyId: string) => {
        const propertyToToggle = properties.find(p => p.id === propertyId);
        if (!propertyToToggle) return;

        const newStatus = propertyToToggle.status === PropertyStatus.ARCHIVED ? PropertyStatus.AVAILABLE : PropertyStatus.ARCHIVED;
        
        const { data, error } = await supabase
            .from('properties')
            .update({ status: newStatus })
            .eq('id', propertyId)
            .select();

        if (error) {
            console.error('Error toggling archive status:', error.message);
            alert(`Error toggling archive status: ${error.message}`);
        } else if (data) {
             setProperties(prev => prev.map(p => p.id === propertyId ? (data[0] as unknown as Property) : p));
        }
    }

    const deleteProperty = async (propertyId: string) => {
        const propertyToDelete = properties.find(p => p.id === propertyId);
        if (!propertyToDelete) return;

        // 1. Delete images from storage
        if (propertyToDelete.images && propertyToDelete.images.length > 0) {
            const bucketName = 'property-images';
            const filePaths = propertyToDelete.images.map(url => {
                try {
                    // Public URL format: https://<project_ref>.supabase.co/storage/v1/object/public/<bucket_name>/<file_path>
                    const urlObject = new URL(url);
                    // We need to extract the <file_path> part.
                    const pathParts = urlObject.pathname.split(`/${bucketName}/`);
                    if (pathParts.length > 1) {
                        return pathParts[1];
                    }
                    console.warn('Could not extract file path from URL:', url);
                    return null;
                } catch (e) {
                    console.warn('Could not parse image URL to delete from storage:', url);
                    return null;
                }
            }).filter((path): path is string => path !== null);

            if (filePaths.length > 0) {
                const { error: storageError } = await supabase.storage
                    .from(bucketName)
                    .remove(filePaths);

                if (storageError) {
                    console.error('Error deleting property images:', storageError);
                    alert(`Não foi possível remover as imagens do armazenamento. Erro: ${storageError.message}. O imóvel ainda será excluído.`);
                }
            }
        }

        // 2. Delete the property record
        const { error: dbError } = await supabase
            .from('properties')
            .delete()
            .eq('id', propertyId);

        if (dbError) {
            console.error('Error deleting property:', dbError.message);
            alert(`Erro ao excluir imóvel: ${dbError.message}`);
        } else {
            setProperties(prev => prev.filter(p => p.id !== propertyId));
        }
    };


    return (
        <PropertyContext.Provider value={{ properties, addProperty, updateProperty, toggleArchiveProperty, deleteProperty, loading }}>
            {children}
        </PropertyContext.Provider>
    );
};

export const useProperties = () => {
    const context = useContext(PropertyContext);
    if (context === undefined) {
        throw new Error('useProperties must be used within a PropertyProvider');
    }
    return context;
};