
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Property, PropertyStatus } from '../types';
import { supabase } from '../lib/supabaseClient';

interface PropertyContextType {
    properties: Property[];
    addProperty: (property: Omit<Property, 'id'>) => Promise<void>;
    updateProperty: (updatedProperty: Property) => Promise<void>;
    toggleArchiveProperty: (propertyId: string) => Promise<void>;
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
            setProperties(data as Property[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    const addProperty = async (property: Omit<Property, 'id'>) => {
        const { data, error } = await supabase
            .from('properties')
            .insert([property])
            .select();
        
        if (error) {
            console.error('Error adding property:', error.message);
            alert(`Error adding property: ${error.message}`);
        } else if (data) {
            setProperties(prev => [data[0] as Property, ...prev]);
        }
    };

    const updateProperty = async (updatedProperty: Property) => {
        const { id, ...updateData } = updatedProperty;
        const { data, error } = await supabase
            .from('properties')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) {
            console.error('Error updating property:', error.message);
            alert(`Error updating property: ${error.message}`);
        } else if (data) {
            setProperties(prev => prev.map(p => p.id === updatedProperty.id ? (data[0] as Property) : p));
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
             setProperties(prev => prev.map(p => p.id === propertyId ? (data[0] as Property) : p));
        }
    }

    return (
        <PropertyContext.Provider value={{ properties, addProperty, updateProperty, toggleArchiveProperty, loading }}>
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