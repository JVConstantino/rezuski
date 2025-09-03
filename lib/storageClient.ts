import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Função para obter o cliente de storage baseado na configuração ativa
export const getStorageClient = (storageUrl?: string, storageKey?: string) => {
    // Use as configurações fornecidas ou fallback para o cliente Constantino
    const url = storageUrl || 'https://constantino-supabase.62mil3.easypanel.host';
    const key = storageKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';
    
    return createClient<Database>(url, key);
};

// Função para obter a URL completa da imagem baseada no caminho relativo
export const getImageUrl = (relativePath: string, storageUrl?: string, bucketName?: string): string => {
    if (!relativePath) return '';
    
    // Se já é uma URL completa, retorna como está
    if (relativePath.startsWith('http')) return relativePath;
    
    // Constrói a URL usando a configuração fornecida ou padrão Constantino
    const baseUrl = storageUrl || 'https://constantino-supabase.62mil3.easypanel.host';
    const bucket = bucketName || 'property-images';
    
    return `${baseUrl}/storage/v1/object/public/${bucket}/${relativePath}`;
};

// Função para extrair o caminho relativo de uma URL completa
export const getRelativePath = (fullUrl: string, bucketName?: string): string | null => {
    if (!fullUrl || !fullUrl.startsWith('http')) return fullUrl;
    
    try {
        const urlObject = new URL(fullUrl);
        const bucket = bucketName || 'property-images';
        const pathParts = urlObject.pathname.split(`/${bucket}/`);
        
        if (pathParts.length > 1) {
            return decodeURIComponent(pathParts[1]);
        }
        return null;
    } catch (e) {
        console.warn('Could not parse URL to extract path:', fullUrl);
        return null;
    }
};