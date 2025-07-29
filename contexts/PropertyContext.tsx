
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { Property, PropertyStatus, Amenity, PriceHistory } from '../types';
import { supabase } from '../lib/supabaseClient';
import { Database } from '../types/supabase';

interface PropertyContextType {
    properties: Property[];
    addProperty: (property: Omit<Property, 'id'>) => Promise<void>;
    updateProperty: (updatedProperty: Property) => Promise<void>;
    toggleArchiveProperty: (propertyId: string) => Promise<void>;
    deleteProperty: (propertyId: string) => Promise<void>;
    incrementViewCount: (propertyId: string) => Promise<void>;
    updatePropertyOrder: (updates: { id: string; display_order: number }[]) => Promise<void>;
    loading: boolean;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

const VIEW_COUNT_STORAGE_KEY = 'rezuski_property_view_counts';

// Helper to get view counts from localStorage
const getStoredViewCounts = (): Record<string, number> => {
    try {
        const stored = localStorage.getItem(VIEW_COUNT_STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (error) {
        console.error("Error reading view counts from localStorage", error);
        return {};
    }
};

// Helper to set view counts in localStorage
const setStoredViewCounts = (counts: Record<string, number>) => {
    try {
        localStorage.setItem(VIEW_COUNT_STORAGE_KEY, JSON.stringify(counts));
    } catch (error) {
        console.error("Error saving view counts to localStorage", error);
    }
};


export const PropertyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProperties = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .order('display_order', { ascending: true, nullsFirst: false })
            .order('createdAt', { ascending: false });

        if (error) {
            console.error('Error fetching properties:', error);
            setProperties([]);
        } else {
            const fetchedProperties = data as unknown as Property[];
            const storedViewCounts = getStoredViewCounts();

            // Merge stored view counts with fetched data. Prioritize higher value.
            const propertiesWithLocalViews = fetchedProperties.map(prop => ({
                ...prop,
                viewCount: Math.max(storedViewCounts[prop.id] || 0, prop.viewCount || 0),
            }));
            
            // Sync back the merged counts to localStorage
            const newStoredCounts = { ...storedViewCounts };
            propertiesWithLocalViews.forEach(prop => {
                newStoredCounts[prop.id] = prop.viewCount || 0;
            });
            setStoredViewCounts(newStoredCounts);

            setProperties(propertiesWithLocalViews);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchProperties();
    }, [fetchProperties]);
    
    const updatePropertyOrder = async (updates: { id: string; display_order: number }[]) => {
        const { error } = await supabase.from('properties').upsert(updates);
        if (error) {
            console.error('Error updating property order:', error.message);
            alert(`Erro ao salvar a ordem: ${error.message}`);
        } else {
            // Refetch to get the correctly ordered list from the DB
            await fetchProperties();
        }
    };

    const incrementViewCount = useCallback(async (propertyId: string) => {
        // Optimistic UI update and localStorage update
        setProperties(prev => {
            const newProperties = prev.map(p =>
                p.id === propertyId ? { ...p, viewCount: (p.viewCount || 0) + 1 } : p
            );
            
            const propertyToUpdate = newProperties.find(p => p.id === propertyId);
            if (propertyToUpdate) {
                const storedViewCounts = getStoredViewCounts();
                storedViewCounts[propertyId] = propertyToUpdate.viewCount || 0;
                setStoredViewCounts(storedViewCounts);
            }
            
            return newProperties;
        });

        // Update backend (fire and forget)
        const { error } = await supabase.rpc('increment_view_count', {
            prop_id: propertyId
        });

        if (error) {
            console.error('Error incrementing view count in DB:', error.message);
            // Optional: handle error, maybe revert optimistic update if needed
        }
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
            await fetchProperties(); // Refetch to maintain order
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
             setProperties(prev => prev.map(p => p.id === updatedProperty.id ? (data[0] as unknown as Property) : p));
        }
    };
    
    const toggleArchiveProperty = async (propertyId: string) => {
        const propertyToToggle = properties.find(p => p.id === propertyId);
        if (!propertyToToggle) return;

        const newStatus = propertyToToggle.status === 'ARCHIVED' ? 'AVAILABLE' : 'ARCHIVED';
        
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
                    const urlObject = new URL(url);
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
        <PropertyContext.Provider value={{ properties, addProperty, updateProperty, toggleArchiveProperty, deleteProperty, loading, incrementViewCount, updatePropertyOrder }}>
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