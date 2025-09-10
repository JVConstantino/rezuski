

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
    bulkUpdateProperties: (propertyIds: string[], updates: Partial<Property>) => Promise<void>;
    bulkDeleteProperties: (propertyIds: string[]) => Promise<void>;
    loadMoreProperties: () => Promise<void>;
    hasMoreProperties: boolean;
    totalCount: number;
    loading: boolean;
    loadingMore: boolean;
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


const PROPERTIES_PER_PAGE = 1000; // Aumentado para carregar todas as propriedades
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

interface CacheData {
    data: Property[];
    timestamp: number;
    totalCount: number;
    hasMore: boolean;
    page: number;
}

export const PropertyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMoreProperties, setHasMoreProperties] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [cache, setCache] = useState<Map<string, CacheData>>(new Map());

    const getCacheKey = (page: number) => `properties_page_${page}`;

    const isCacheValid = (cacheData: CacheData): boolean => {
        return Date.now() - cacheData.timestamp < CACHE_TTL;
    };

    const clearCache = () => {
        setCache(new Map());
    };

    const fetchProperties = useCallback(async (reset = true) => {
        if (reset) {
            setLoading(true);
            setCurrentPage(0);
            setProperties([]);
        } else {
            setLoadingMore(true);
        }

        // Carregar todas as propriedades de uma vez
        const { data, error, count } = await supabase
            .from('properties')
            .select('*', { count: 'exact' })
            .order('display_order', { ascending: true, nullsFirst: false })
            .order('createdAt', { ascending: false });

        if (error) {
            console.error('Error fetching properties:', error);
            if (reset) {
                setProperties([]);
            }
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

            if (reset) {
                setProperties(propertiesWithLocalViews);
            } else {
                setProperties(prev => [...prev, ...propertiesWithLocalViews]);
            }
            
            setCurrentPage(0);
            setTotalCount(count || 0);
            setHasMoreProperties(false); // Não há mais páginas
        }
        
        setLoading(false);
        setLoadingMore(false);
    }, []);

    const loadMoreProperties = useCallback(async () => {
        if (!loadingMore && hasMoreProperties) {
            await fetchProperties(false);
        }
    }, [fetchProperties, loadingMore, hasMoreProperties]);

    useEffect(() => {
        fetchProperties(true);
    }, []);
    
    const updatePropertyOrder = async (updates: { id: string; display_order: number }[]) => {
        console.log('🔄 Starting property order update with:', updates);
        
        try {
            const updatePromises = updates.map(u => {
                console.log(`📝 Updating property ${u.id} to display_order ${u.display_order}`);
                return supabase.from('properties').update({ display_order: u.display_order }).eq('id', u.id);
            });
        
            const results = await Promise.all(updatePromises);
            console.log('📊 Update results:', results);
            
            const firstError = results.find(res => res.error);
        
            if (firstError) {
                console.error('❌ Error updating property order:', firstError.error);
                alert(`Erro ao salvar a ordem: ${firstError.error.message}`);
                return;
            }
            
            console.log('✅ Property order updated successfully');
            clearCache(); // Clear cache when data changes
            
            // Refetch to get the correctly ordered list from the DB
            console.log('🔄 Refetching properties with new order...');
            await fetchProperties(true);
            console.log('✅ Properties refetched successfully');
            
        } catch (error) {
            console.error('❌ Unexpected error in updatePropertyOrder:', error);
            alert(`Erro inesperado ao salvar a ordem: ${error}`);
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
        // Debug: verificar dados recebidos
        console.log('PropertyContext - addProperty recebeu:', {
            tourUrl: property.tourUrl,
            youtubeUrl: property.youtubeUrl,
            fullProperty: property
        });
        
        console.log('PropertyContext - Dados sendo enviados para o Supabase:', JSON.stringify(property, null, 2));
        
        const { data, error } = await supabase
            .from('properties')
            .insert([property])
            .select();
            
        console.log('PropertyContext - Resposta do Supabase:', { data, error });
        
        if (error) {
            console.error('Error adding property:', error.message);
            console.error('Error details:', error);
            alert(`Error adding property: ${error.message}`);
        } else if (data) {
            console.log('PropertyContext - Propriedade salva com sucesso:', data[0]);
            clearCache(); // Clear cache when data changes
            await fetchProperties(); // Refetch to maintain order
        }
    };

    const updateProperty = async (updatedProperty: Property) => {
        const { id, ...updateData } = updatedProperty;
        
        // Debug: verificar dados recebidos
        console.log('PropertyContext - updateProperty recebeu:', {
            id: id,
            tourUrl: updateData.tourUrl,
            youtubeUrl: updateData.youtubeUrl,
            fullUpdateData: updateData
        });
        
        const { data, error } = await supabase
            .from('properties')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) {
            console.error('Error updating property:', error.message);
            console.error('Error details:', error);
            alert(`Error updating property: ${error.message}`);
        } else if (data) {
            console.log('PropertyContext - Propriedade atualizada com sucesso:', data[0]);
            clearCache(); // Clear cache when data changes
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
            clearCache(); // Clear cache when data changes
            setProperties(prev => prev.map(p => p.id === propertyId ? (data[0] as unknown as Property) : p));
        }
    }

    const deleteProperty = async (propertyId: string) => {
        console.log('🗑️ Starting property deletion for ID:', propertyId);
        
        const propertyToDelete = properties.find(p => p.id === propertyId);
        if (!propertyToDelete) {
            console.error('❌ Property not found in local state:', propertyId);
            alert('Propriedade não encontrada.');
            return;
        }

        console.log('📋 Property to delete:', propertyToDelete.title);

        try {
            // 1. Delete images from storage
            if (propertyToDelete.images && propertyToDelete.images.length > 0) {
                console.log('🖼️ Deleting images from storage:', propertyToDelete.images.length, 'images');
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
                    console.log('📁 File paths to delete:', filePaths);
                    const { error: storageError } = await supabase.storage
                        .from(bucketName)
                        .remove(filePaths);

                    if (storageError) {
                        console.error('❌ Error deleting property images:', storageError);
                        alert(`Não foi possível remover as imagens do armazenamento. Erro: ${storageError.message}. O imóvel ainda será excluído.`);
                    } else {
                        console.log('✅ Images deleted successfully');
                    }
                }
            } else {
                console.log('📷 No images to delete');
            }

            // 2. Delete the property record
            console.log('🗄️ Deleting property record from database...');
            const { error: dbError } = await supabase
                .from('properties')
                .delete()
                .eq('id', propertyId);

            if (dbError) {
                console.error('❌ Error deleting property from database:', dbError);
                alert(`Erro ao excluir imóvel: ${dbError.message}`);
                return;
            }

            console.log('✅ Property deleted successfully from database');
            clearCache(); // Clear cache when data changes
            setProperties(prev => prev.filter(p => p.id !== propertyId));
            console.log('🔄 Local state updated');
            alert('Propriedade excluída com sucesso!');
            
        } catch (error) {
            console.error('❌ Unexpected error during property deletion:', error);
            alert(`Erro inesperado ao excluir propriedade: ${error}`);
        }
    };

    const bulkUpdateProperties = async (propertyIds: string[], updates: Partial<Property>) => {
        const { error } = await supabase
            .from('properties')
            .update(updates)
            .in('id', propertyIds);

        if (error) {
            console.error('Error in bulk update:', error.message);
            alert(`Erro na atualização em massa: ${error.message}`);
        } else {
            clearCache(); // Clear cache when data changes
            await fetchProperties(); // Refetch to show changes
            alert(`${propertyIds.length} imóveis atualizados com sucesso.`);
        }
    };

    const bulkDeleteProperties = async (propertyIds: string[]) => {
        setLoading(true);
        const propertiesToDelete = properties.filter(p => propertyIds.includes(p.id));
        
        // 1. Collect all image paths to delete
        const allImagePaths: string[] = [];
        const bucketName = 'property-images';
        propertiesToDelete.forEach(prop => {
            if (prop.images && prop.images.length > 0) {
                const filePaths = prop.images.map(url => {
                    try {
                        const urlObject = new URL(url);
                        const pathParts = urlObject.pathname.split(`/${bucketName}/`);
                        return pathParts.length > 1 ? pathParts[1] : null;
                    } catch (e) { return null; }
                }).filter((path): path is string => path !== null);
                allImagePaths.push(...filePaths);
            }
        });

        // 2. Bulk delete images from storage
        if (allImagePaths.length > 0) {
            const { error: storageError } = await supabase.storage.from(bucketName).remove(allImagePaths);
            if (storageError) {
                console.error('Error during bulk image deletion:', storageError.message);
                alert(`Erro ao excluir imagens: ${storageError.message}. A exclusão dos imóveis continuará.`);
            }
        }

        // 3. Bulk delete from DB
        const { error: dbError } = await supabase
            .from('properties')
            .delete()
            .in('id', propertyIds);

        if (dbError) {
            console.error('Error deleting properties:', dbError.message);
            alert(`Erro ao excluir imóveis: ${dbError.message}`);
        } else {
            clearCache(); // Clear cache when data changes
            await fetchProperties();
            alert(`${propertyIds.length} imóveis excluídos com sucesso.`);
        }
        setLoading(false);
    };

    return (
        <PropertyContext.Provider value={{
            properties,
            addProperty,
            updateProperty,
            toggleArchiveProperty,
            deleteProperty,
            incrementViewCount,
            updatePropertyOrder,
            bulkUpdateProperties,
            bulkDeleteProperties,
            loadMoreProperties,
            hasMoreProperties,
            totalCount,
            loading,
            loadingMore
        }}>
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
