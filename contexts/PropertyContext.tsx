
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Property, PropertyStatus } from '../types';
import { supabase } from '../lib/supabaseClient';

interface PropertyContextType {
    properties: Property[];
    addProperty: (property: Property) => Promise<void>;
    updateProperty: (updatedProperty: Property) => Promise<void>;
    toggleArchiveProperty: (propertyId: string) => Promise<void>;
    loading: boolean;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProperties = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('properties')
                    .select('*')
                    .order('createdAt', { ascending: false });

                if (error) {
                    console.error('Error fetching properties:', error);
                    setProperties([]);
                } else {
                    // Transform the data to match our Property interface
                    const transformedProperties = data.map(prop => ({
                        ...prop,
                        amenities: prop.amenities as any,
                        priceHistory: prop.priceHistory as any
                    }));
                    setProperties(transformedProperties);
                }
            } catch (error) {
                console.error('Error fetching properties:', error);
                setProperties([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, []);

    const addProperty = async (property: Property) => {
        try {
            const { data, error } = await supabase
                .from('properties')
                .insert([{
                    ...property,
                    amenities: property.amenities,
                    priceHistory: property.priceHistory
                }])
                .select()
                .single();

            if (error) {
                console.error('Error adding property:', error);
                throw error;
            }

            const transformedProperty = {
                ...data,
                amenities: data.amenities as any,
                priceHistory: data.priceHistory as any
            };

            setProperties(prev => [transformedProperty, ...prev]);
        } catch (error) {
            console.error('Error adding property:', error);
            throw error;
        }
    };

    const updateProperty = async (updatedProperty: Property) => {
        try {
            const { error } = await supabase
                .from('properties')
                .update({
                    ...updatedProperty,
                    amenities: updatedProperty.amenities,
                    priceHistory: updatedProperty.priceHistory
                })
                .eq('id', updatedProperty.id);

            if (error) {
                console.error('Error updating property:', error);
                throw error;
            }

            setProperties(prev => prev.map(p => p.id === updatedProperty.id ? updatedProperty : p));
        } catch (error) {
            console.error('Error updating property:', error);
            throw error;
        }
    };
    
    const toggleArchiveProperty = async (propertyId: string) => {
        try {
            const propertyToToggle = properties.find(p => p.id === propertyId);
            if (!propertyToToggle) return;

            const newStatus = propertyToToggle.status === PropertyStatus.ARCHIVED ? PropertyStatus.AVAILABLE : PropertyStatus.ARCHIVED;
            
            const { error } = await supabase
                .from('properties')
                .update({ status: newStatus })
                .eq('id', propertyId);

            if (error) {
                console.error('Error toggling property archive status:', error);
                throw error;
            }

            setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, status: newStatus } : p));
        } catch (error) {
            console.error('Error toggling property archive status:', error);
            throw error;
        }
    };

    return (
        <PropertyContext.Provider value={{ properties, addProperty, updateProperty, toggleArchiveProperty, loading }}>
            {!loading && children}
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