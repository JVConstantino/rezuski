import { Property } from '../types';
import { translations } from '../translations';
import { supabase } from './supabaseClient';

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

export function getOptimizedImageUrl(fullUrl: string, options: { width: number; height: number; }): string {
    const filePath = getPathFromUrl(fullUrl);
    if (!filePath) {
        return fullUrl; // Fallback to original if path extraction fails
    }

    const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath, {
            transform: {
                width: options.width,
                height: options.height,
                resize: 'cover',
            },
        });
    
    return data.publicUrl;
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