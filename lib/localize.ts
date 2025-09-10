import { Property } from '../types';
import { translations } from '../translations';
import { supabase } from './supabaseClient';
import { getStorageClient, getImageUrl, getRelativePath } from './storageClient';

const BUCKET_NAME = 'property-images';

function getPathFromUrl(fullUrl: string): string | null {
    if (!fullUrl || !fullUrl.startsWith('http')) return null;
    try {
        const urlObject = new URL(fullUrl);
        const pathParts = urlObject.pathname.split(`/${BUCKET_NAME}/`);
        if (pathParts.length > 1) {
            // Decode URI component to handle spaces and special characters in filenames
            return decodeURIComponent(pathParts[1]);
        }
        return null;
    } catch (e) {
        console.warn('Could not parse URL to extract path:', fullUrl);
        return null;
    }
}

export function getOptimizedImageUrl(relativePath: string, options: { width: number; height: number; }, activeStorageConfig?: { storage_url?: string, storage_key?: string, bucket_name?: string }): string {
    if (!relativePath) return '';
    
    // Skip base64 data URLs to prevent 414 errors
    if (relativePath.includes('data:image') || relativePath.includes('base64')) {
        console.warn('Skipping base64 data URL in getOptimizedImageUrl:', relativePath.substring(0, 50) + '...');
        return '';
    }
    
    // Se já é uma URL completa, extrai o caminho relativo primeiro
    const filePath = relativePath.startsWith('http') ? 
        getRelativePath(relativePath, activeStorageConfig?.bucket_name) : relativePath;
        
    if (!filePath) {
        return relativePath; // Fallback to original if path extraction fails
    }

    // Use the active storage configuration or fallback to getImageUrl for basic URL construction
    if (activeStorageConfig?.storage_url && activeStorageConfig?.storage_key) {
        const client = getStorageClient(activeStorageConfig.storage_url, activeStorageConfig.storage_key);
        const bucketName = activeStorageConfig.bucket_name || 'property-images';
        
        const { data } = client.storage
            .from(bucketName)
            .getPublicUrl(filePath, {
                transform: {
                    width: options.width,
                    height: options.height,
                    resize: 'cover',
                },
            });
        
        return data.publicUrl;
    } else {
        // Fallback: construct URL using getImageUrl without transform
        return getImageUrl(filePath, activeStorageConfig?.storage_url, activeStorageConfig?.bucket_name);
    }
}


export const localizeProperty = (property: Property, locale: keyof typeof translations): Property => {
    if (!property) return property;

    const translatedProperty = { ...property };

    if (property.translations && locale !== 'pt-BR') {
        const translationData = property.translations[locale];
        if (translationData) {
            translatedProperty.title = translationData.title || property.title;
            translatedProperty.description = translationData.description || property.description;
        }
    }
    
    return translatedProperty;
};