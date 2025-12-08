import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { Property, PropertyStatus, Amenity, PriceHistory } from '../types';
import { supabase } from '../lib/supabaseClient';
import { Database } from '../types/supabase';

// Constante para modo de debug - desabilitar em produção
const IS_DEV = import.meta.env.DEV;

interface PropertyContextType {
    properties: Property[];
    addProperty: (property: Omit<Property, 'id'>) => Promise<Property | undefined>;
    updateProperty: (updatedProperty: Property) => Promise<Property | undefined>;
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
    refreshProperties: () => Promise<void>;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

const VIEW_COUNT_STORAGE_KEY = 'rezuski_property_view_counts';

// Helper to get view counts from localStorage
const getStoredViewCounts = (): Record<string, number> => {
    try {
        const stored = localStorage.getItem(VIEW_COUNT_STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
};

// Helper to set view counts in localStorage
const setStoredViewCounts = (counts: Record<string, number>) => {
    try {
        localStorage.setItem(VIEW_COUNT_STORAGE_KEY, JSON.stringify(counts));
    } catch {
        // Silently fail if localStorage is full or unavailable
    }
};

// Configurações de paginação - carrega todos para o admin
const PROPERTIES_PER_PAGE = 1000; // Carrega todas as propriedades para permitir ordenação completa
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

    const isCacheValid = useCallback((cacheData: CacheData): boolean => {
        return Date.now() - cacheData.timestamp < CACHE_TTL;
    }, []);

    const clearCache = useCallback(() => {
        setCache(new Map());
    }, []);

    const fetchProperties = useCallback(async (reset = true, page = 0) => {
        const cacheKey = getCacheKey(page);
        const cachedData = cache.get(cacheKey);

        // Verifica cache válido
        if (cachedData && isCacheValid(cachedData) && !reset) {
            if (IS_DEV) console.log('📦 Using cached properties for page:', page);
            return;
        }

        if (reset) {
            setLoading(true);
            setCurrentPage(0);
            setProperties([]);
        } else {
            setLoadingMore(true);
        }

        const from = page * PROPERTIES_PER_PAGE;
        const to = from + PROPERTIES_PER_PAGE - 1;

        const { data, error, count } = await supabase
            .from('properties')
            .select('*', { count: 'exact' })
            .order('display_order', { ascending: true, nullsFirst: false })
            .order('createdAt', { ascending: false })
            .range(from, to);

        if (error) {
            if (IS_DEV) console.error('Error fetching properties:', error);
            if (reset) {
                setProperties([]);
            }
        } else {
            const fetchedProperties = data as unknown as Property[];
            const storedViewCounts = getStoredViewCounts();

            // Merge stored view counts with fetched data
            const propertiesWithLocalViews = fetchedProperties.map(prop => ({
                ...prop,
                viewCount: Math.max(storedViewCounts[prop.id] || 0, prop.viewCount || 0),
            }));

            // Sync back the merged counts to localStorage (batch update)
            const newStoredCounts = { ...storedViewCounts };
            propertiesWithLocalViews.forEach(prop => {
                newStoredCounts[prop.id] = prop.viewCount || 0;
            });
            setStoredViewCounts(newStoredCounts);

            // Atualiza cache
            const newCacheData: CacheData = {
                data: propertiesWithLocalViews,
                timestamp: Date.now(),
                totalCount: count || 0,
                hasMore: (from + fetchedProperties.length) < (count || 0),
                page
            };
            setCache(prev => new Map(prev).set(cacheKey, newCacheData));

            if (reset) {
                setProperties(propertiesWithLocalViews);
            } else {
                // Evita duplicatas ao carregar mais
                setProperties(prev => {
                    const existingIds = new Set(prev.map(p => p.id));
                    const newProperties = propertiesWithLocalViews.filter(p => !existingIds.has(p.id));
                    return [...prev, ...newProperties];
                });
            }

            setCurrentPage(page);
            setTotalCount(count || 0);
            setHasMoreProperties((from + fetchedProperties.length) < (count || 0));
        }

        setLoading(false);
        setLoadingMore(false);
    }, [cache, isCacheValid]);

    const loadMoreProperties = useCallback(async () => {
        if (!loadingMore && hasMoreProperties) {
            await fetchProperties(false, currentPage + 1);
        }
    }, [fetchProperties, loadingMore, hasMoreProperties, currentPage]);

    const refreshProperties = useCallback(async () => {
        clearCache();
        await fetchProperties(true, 0);
    }, [fetchProperties, clearCache]);

    useEffect(() => {
        fetchProperties(true, 0);
    }, []);

    const updatePropertyOrder = async (updates: { id: string; display_order: number }[]) => {
        if (IS_DEV) console.log('🔄 Starting property order update with:', updates);

        try {
            const updatePromises = updates.map(u => {
                return supabase.from('properties').update({ display_order: u.display_order }).eq('id', u.id);
            });

            const results = await Promise.all(updatePromises);

            const firstError = results.find(res => res.error);

            if (firstError) {
                console.error('Error updating property order:', firstError.error);
                alert(`Erro ao salvar a ordem: ${firstError.error.message}`);
                return;
            }

            if (IS_DEV) console.log('✅ Property order updated successfully');
            clearCache();
            await fetchProperties(true, 0);

        } catch (error) {
            console.error('Unexpected error in updatePropertyOrder:', error);
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

        if (error && IS_DEV) {
            console.error('Error incrementing view count in DB:', error.message);
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
            return undefined;
        } else if (data) {
            if (IS_DEV) console.log('PropertyContext - Propriedade salva com sucesso:', data[0]);
            clearCache();
            await fetchProperties(true, 0);
            return data[0] as unknown as Property;
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
            return undefined;
        } else if (data) {
            if (IS_DEV) console.log('PropertyContext - Propriedade atualizada com sucesso:', data[0]);
            clearCache();
            setProperties(prev => prev.map(p => p.id === updatedProperty.id ? (data[0] as unknown as Property) : p));
            return data[0] as unknown as Property;
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
            clearCache();
            setProperties(prev => prev.map(p => p.id === propertyId ? (data[0] as unknown as Property) : p));
        }
    }

    const deleteProperty = async (propertyId: string) => {
        const propertyToDelete = properties.find(p => p.id === propertyId);
        if (!propertyToDelete) {
            alert('Propriedade não encontrada.');
            return;
        }

        try {
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
                        return null;
                    } catch {
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
                console.error('Error deleting property from database:', dbError);
                alert(`Erro ao excluir imóvel: ${dbError.message}`);
                return;
            }

            clearCache();
            setProperties(prev => prev.filter(p => p.id !== propertyId));
            alert('Propriedade excluída com sucesso!');

        } catch (error) {
            console.error('Unexpected error during property deletion:', error);
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
            clearCache();
            await fetchProperties(true, 0);
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
                    } catch { return null; }
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
            clearCache();
            await fetchProperties(true, 0);
            alert(`${propertyIds.length} imóveis excluídos com sucesso.`);
        }
        setLoading(false);
    };

    // Memoiza o valor do contexto para evitar re-renders desnecessários
    const contextValue = useMemo(() => ({
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
        loadingMore,
        refreshProperties
    }), [
        properties,
        hasMoreProperties,
        totalCount,
        loading,
        loadingMore,
        loadMoreProperties,
        incrementViewCount,
        refreshProperties
    ]);

    return (
        <PropertyContext.Provider value={contextValue}>
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
