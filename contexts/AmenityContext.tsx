import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ManagedAmenity } from '../types';

interface AmenityContextType {
    amenities: ManagedAmenity[];
    addAmenity: (name: string) => Promise<void>;
    updateAmenity: (id: string, name: string) => Promise<void>;
    deleteAmenity: (amenityId: string) => Promise<void>;
    loading: boolean;
}

const AmenityContext = createContext<AmenityContextType | undefined>(undefined);

export const AmenityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [amenities, setAmenities] = useState<ManagedAmenity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAmenities = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('amenities').select('*').order('name', { ascending: true });
            if (error) {
                console.error('Error fetching amenities:', error);
                setAmenities([]);
            } else {
                setAmenities(data || []);
            }
            setLoading(false);
        };
        fetchAmenities();
    }, []);

    const addAmenity = async (name: string) => {
        const { data, error } = await supabase
            .from('amenities')
            .insert([{ name }])
            .select()
            .single();

        if (error) {
            console.error('Error adding amenity:', error);
            alert(`Erro ao adicionar comodidade: ${error.message}`);
        } else if (data) {
            setAmenities(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
        }
    };

    const updateAmenity = async (id: string, name: string) => {
        const { error } = await supabase
            .from('amenities')
            .update({ name })
            .eq('id', id);

        if (error) {
            console.error('Error updating amenity:', error);
            alert(`Erro ao atualizar comodidade: ${error.message}`);
        } else {
            setAmenities(prev => prev.map(a => (a.id === id ? { ...a, name } : a)).sort((a, b) => a.name.localeCompare(b.name)));
        }
    };

    const deleteAmenity = async (amenityId: string) => {
        const { error } = await supabase
            .from('amenities')
            .delete()
            .eq('id', amenityId);
        
        if (error) {
            console.error('Error deleting amenity:', error);
            alert(`Erro ao remover comodidade: ${error.message}`);
        } else {
            setAmenities(prev => prev.filter(a => a.id !== amenityId));
        }
    };

    return (
        <AmenityContext.Provider value={{ amenities, addAmenity, updateAmenity, deleteAmenity, loading }}>
            {!loading && children}
        </AmenityContext.Provider>
    );
};

export const useAmenities = () => {
    const context = useContext(AmenityContext);
    if (context === undefined) {
        throw new Error('useAmenities must be used within an AmenityProvider');
    }
    return context;
};
