import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Cache para evitar múltiplas instâncias do cliente Supabase
const clientCache = new Map<string, any>();

// Função para obter o cliente de storage baseado na configuração ativa
export const getStorageClient = (storageUrl?: string, storageKey?: string) => {
    try {
        // Use as configurações fornecidas ou fallback para as variáveis de ambiente
        const url = storageUrl || import.meta.env.VITE_SUPABASE_URL || 'https://rezuski-server-rezuski-db-server.h7c5nc.easypanel.host';
        const key = storageKey || import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!url || !key) {
            console.error('Supabase URL and key are required');
            return null;
        }
        
        // Use cache para evitar múltiplas instâncias
        const cacheKey = `${url}:${key}`;
        if (clientCache.has(cacheKey)) {
            return clientCache.get(cacheKey);
        }
        
        const client = createClient<Database>(url, key);
        clientCache.set(cacheKey, client);
        return client;
    } catch (error) {
        console.error('Error creating Supabase client:', error);
        return null;
    }
};

// Função para obter a URL completa da imagem baseada no caminho relativo
export const getImageUrl = (relativePath: string, storageUrl?: string, bucketName?: string): string => {
    try {
        if (!relativePath) {
            console.warn('Relative path is required for getImageUrl');
            return '';
        }
        
        // Se já é uma URL completa, retorna como está
        if (relativePath.startsWith('http')) return relativePath;
        
        // Constrói a URL usando a configuração fornecida ou variáveis de ambiente
        const baseUrl = storageUrl || import.meta.env.VITE_SUPABASE_URL || 'https://rezuski-server-rezuski-db-server.h7c5nc.easypanel.host';
        const bucket = bucketName || 'property-images';
        
        if (!baseUrl) {
            console.error('Storage URL is required to generate image URL');
            return '';
        }
        
        return `${baseUrl}/storage/v1/object/public/${bucket}/${relativePath}`;
    } catch (error) {
        console.error('Error generating image URL:', error);
        return '';
    }
};

// Função para extrair o caminho relativo de uma URL completa
export const getRelativePath = (fullUrl: string, bucketName?: string): string | null => {
    try {
        if (!fullUrl) {
            console.warn('Full URL is required for getRelativePath');
            return null;
        }
        
        if (!fullUrl.startsWith('http')) return fullUrl;
        
        const urlObject = new URL(fullUrl);
        const bucket = bucketName || 'property-images';
        const pathParts = urlObject.pathname.split(`/${bucket}/`);
        
        if (pathParts.length > 1) {
            return decodeURIComponent(pathParts[1]);
        }
        return null;
    } catch (error) {
        console.error('Error extracting relative path from URL:', fullUrl, error);
        return null;
    }
};