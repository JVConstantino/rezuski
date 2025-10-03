import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getStorageClient, getImageUrl, getRelativePath } from '../lib/storageClient';
import { useStorageConfig } from './StorageConfigContext';
import { useAuth } from './AuthContext';

interface ItemToMove {
    name: string;
    isFolder: boolean;
}
interface ImageContextType {
    galleryItems: any[];
    currentPath: string;
    setPath: (path: string) => void;
    refresh: () => void;
    loading: boolean;
    uploadFiles: (files: FileList, path: string) => Promise<void>;
    createFolder: (folderName: string) => Promise<void>;
    deleteFile: (filePath: string) => Promise<void>;
    deleteFolder: (folderPath: string) => Promise<void>;
    moveItems: (items: ItemToMove[], destinationPath: string) => Promise<void>;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

const PLACEHOLDER_FILE = '.emptyFolder';

export const ImageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { activeConfig } = useStorageConfig();
    const { user } = useAuth();
    const BUCKET_NAME = activeConfig?.bucket_name || 'property-images';
    const [galleryItems, setGalleryItems] = useState<any[]>([]);
    const [currentPath, setCurrentPath] = useState('public');
    const [loading, setLoading] = useState(true);

    const getStorageClientInstance = () => {
        return getStorageClient(activeConfig?.storage_url, activeConfig?.storage_key);
    };

    const listAllFiles = async (path: string): Promise<string[]> => {
        const client = getStorageClientInstance();
        const { data, error } = await client.storage.from(BUCKET_NAME).list(path);
        if (error) {
            console.error(`Error listing files for deletion in ${path}:`, error);
            return [];
        }
    
        const filePaths: string[] = [];
        for (const file of data) {
            const fullPath = `${path}/${file.name}`;
            if (file.id === null) { // It's a folder
                const subFiles = await listAllFiles(fullPath);
                filePaths.push(...subFiles);
            } else {
                filePaths.push(fullPath);
            }
        }
        return filePaths;
    };

    const fetchItemsForPath = async (path: string) => {
        setLoading(true);
        try {
            const client = getStorageClientInstance();
            const { data: listData, error } = await client.storage.from(BUCKET_NAME).list(path, {
                limit: 200,
                offset: 0,
                sortBy: { column: 'name', order: 'asc' },
            });
    
            if (error) {
                console.error(`Error listing storage items for path "${path}":`, error);
                setGalleryItems([]);
                return; // Exit early, finally will run
            }
    
            if (!listData) {
                // This case should ideally not happen if error is null, but as a safeguard.
                setGalleryItems([]);
                return; // Exit early, finally will run
            }
    
            const itemsWithUrls = listData
                .filter(item => item && item.name !== PLACEHOLDER_FILE) // Add a check for item
                .map(item => {
                    if (item.id !== null) { // It's a file
                        const fullPath = `${path}/${item.name}`;
                        // Generate proper URL using active storage configuration
                        const properUrl = getImageUrl(fullPath, activeConfig?.storage_url, activeConfig?.bucket_name);
                        return { ...item, publicUrl: properUrl, relativePath: fullPath };
                    }
                    return item; // It's a folder
                });
    
            const validItems = itemsWithUrls.filter(Boolean);
    
            const sortedData = validItems.sort((a, b) => {
                if (!a || !b) return 0; // Should not happen with filter
                const aIsFolder = a.id === null;
                const bIsFolder = b.id === null;
                if (aIsFolder && !bIsFolder) return -1;
                if (!aIsFolder && bIsFolder) return 1;
                return a.name.localeCompare(b.name);
            });
            
            setGalleryItems(sortedData as any[]);
        } catch (e) {
            console.error("An exception occurred while fetching gallery items:", e);
            setGalleryItems([]);
        } finally {
            setLoading(false);
        }
    };
    
    const refresh = () => {
        fetchItemsForPath(currentPath);
    };

    const ensureFolderExists = async (folderPath: string) => {
        if (folderPath === 'public' || folderPath === '') return;

        const client = getStorageClientInstance();
        const { data: remainingItems, error: listError } = await client.storage
            .from(BUCKET_NAME)
            .list(folderPath);

        if (listError) {
            console.error(`Error checking folder emptiness for ${folderPath}:`, listError);
            return;
        }

        const hasFiles = remainingItems.some(item => item.id !== null && item.name !== PLACEHOLDER_FILE);

        if (!hasFiles) {
            await client.storage
                .from(BUCKET_NAME)
                .upload(`${folderPath}/${PLACEHOLDER_FILE}`, new Blob(['']), { upsert: true });
        }
    };

    const removePlaceholderIfNeeded = async (folderPath: string) => {
        const client = getStorageClientInstance();
        await client.storage
            .from(BUCKET_NAME)
            .remove([`${folderPath}/${PLACEHOLDER_FILE}`]);
    };

    const uploadFiles = async (files: FileList, path: string) => {
        if (!files.length) return;

        setLoading(true);
        try {
            console.log('Starting file upload...', {
                fileCount: files.length,
                path,
                bucketName: BUCKET_NAME,
                activeConfig: activeConfig
            });

            await removePlaceholderIfNeeded(path);
            
            const client = getStorageClientInstance();
            
            // Test bucket accessibility first
            const { data: bucketData, error: bucketError } = await client.storage
                .from(BUCKET_NAME)
                .list('', { limit: 1 });
            
            if (bucketError) {
                console.error('Bucket access error:', bucketError);
                
                if (user?.email === 'joaovictor.priv@gmail.com') {
                    console.log('🔍 DEBUG - Erro de acesso ao bucket (ImageContext):', {
                        bucketName: BUCKET_NAME,
                        error: bucketError,
                        errorMessage: bucketError.message,
                        activeConfig: activeConfig,
                        timestamp: new Date().toISOString()
                    });
                    alert(`❌ DEBUG - Erro de acesso ao bucket (ImageContext):\n\n` +
                          `Bucket: ${BUCKET_NAME}\n` +
                          `Erro: ${bucketError.message}\n` +
                          `Storage URL: ${activeConfig?.storage_url || 'Não configurado'}\n` +
                          `Storage Key: ${activeConfig?.storage_key ? 'Configurado' : 'Não configurado'}\n` +
                          `Timestamp: ${new Date().toLocaleString('pt-BR')}`);
                } else {
                    alert(`Erro ao acessar o bucket: ${bucketError.message}. Verifique se o bucket '${BUCKET_NAME}' existe e está configurado como público.`);
                }
                return;
            }
            
            console.log('Bucket accessible, proceeding with uploads...');
            
            const uploadPromises = Array.from(files).map(async (file, index) => {
                const filePath = `${path}/${file.name}`;
                console.log(`Uploading file ${index + 1}/${files.length}: ${filePath}`);
                
                const { data, error } = await client.storage.from(BUCKET_NAME).upload(filePath, file);
                
                if (error) {
                    console.error(`Upload error for ${filePath}:`, error);
                    
                    if (user?.email === 'joaovictor.priv@gmail.com') {
                        const errorDetails = {
                            fileName: file.name,
                            fileSize: file.size,
                            fileType: file.type,
                            filePath: filePath,
                            bucketName: BUCKET_NAME,
                            storageUrl: activeConfig?.storage_url,
                            hasStorageKey: !!activeConfig?.storage_key,
                            error: error,
                            errorMessage: error.message,
                            timestamp: new Date().toISOString()
                        };
                        
                        console.log('🔍 DEBUG DETALHADO - Upload Image Error (ImageContext):', errorDetails);
                    }
                    
                    throw new Error(`Erro ao fazer upload de ${file.name}: ${error.message}`);
                }
                
                console.log(`Successfully uploaded: ${filePath}`);
                return data;
            });

            await Promise.all(uploadPromises);
            console.log('All files uploaded successfully!');
            alert('Arquivos enviados com sucesso!');
            
        } catch (error) {
            console.error('Upload failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido durante o upload';
            
            if (user?.email === 'joaovictor.priv@gmail.com') {
                const errorDetails = {
                    filesCount: files.length,
                    path: path,
                    bucketName: BUCKET_NAME,
                    storageUrl: activeConfig?.storage_url,
                    hasStorageKey: !!activeConfig?.storage_key,
                    error: error,
                    errorMessage: errorMessage,
                    timestamp: new Date().toISOString()
                };
                
                console.log('🔍 DEBUG DETALHADO - Upload Images Failed (ImageContext):', errorDetails);
                
                alert(`❌ ERRO DETALHADO (ImageContext - Debug para ${user.email}):\n\n` +
                      `Arquivos: ${files.length}\n` +
                      `Caminho: ${path}\n` +
                      `Bucket: ${BUCKET_NAME}\n` +
                      `Storage URL: ${activeConfig?.storage_url || 'Não configurado'}\n` +
                      `Storage Key: ${activeConfig?.storage_key ? 'Configurado' : 'Não configurado'}\n` +
                      `Erro: ${errorMessage}\n` +
                      `Timestamp: ${new Date().toLocaleString('pt-BR')}`);
            } else {
                alert(`Falha no upload: ${errorMessage}`);
            }
        } finally {
            setLoading(false);
            refresh();
        }
    };

    const createFolder = async (folderName: string) => {
        if (!folderName.trim()) {
            alert('Nome da pasta não pode ser vazio.');
            return;
        }
        const cleanFolderName = folderName.trim().replace(/[/\\?%*:|"<>]/g, '-');
        const filePath = `${currentPath}/${cleanFolderName}/${PLACEHOLDER_FILE}`;
        
        setLoading(true);
        const client = getStorageClientInstance();
        await client.storage
            .from(BUCKET_NAME)
            .upload(filePath, new Blob(['']));
        refresh();
    };
    
    const deleteFile = async (filePath: string) => {
        setLoading(true);
        const client = getStorageClientInstance();
        const { error } = await client.storage
            .from(BUCKET_NAME)
            .remove([filePath]);

        if (!error) {
            const parentPath = filePath.substring(0, filePath.lastIndexOf('/'));
            await ensureFolderExists(parentPath);
        } else {
            console.error(`Error deleting file ${filePath}:`, error);
        }
        
        refresh();
    };
    
    const deleteFolder = async (folderPath: string) => {
        setLoading(true);
        let filesToDelete = await listAllFiles(folderPath);

        if (filesToDelete.length === 0) {
            filesToDelete.push(`${folderPath}/${PLACEHOLDER_FILE}`);
        }
        
        const client = getStorageClientInstance();
        await client.storage
            .from(BUCKET_NAME)
            .remove(filesToDelete);
        
        refresh();
    };

    const moveItems = async (items: ItemToMove[], destinationPath: string) => {
        setLoading(true);
    
        await removePlaceholderIfNeeded(destinationPath);

        const client = getStorageClientInstance();
        for (const item of items) {
            const fromPath = `${currentPath}/${item.name}`;
            
            if (fromPath === destinationPath || (item.isFolder && destinationPath.startsWith(fromPath + '/'))) {
                console.warn(`Skipping move of ${item.name}: cannot move into itself.`);
                continue;
            }
    
            if (item.isFolder) {
                let filesToMove = await listAllFiles(fromPath);
                if (filesToMove.length === 0) {
                    filesToMove.push(`${fromPath}/${PLACEHOLDER_FILE}`);
                }
    
                for (const oldFilePath of filesToMove) {
                    const relativePath = oldFilePath.substring(fromPath.length);
                    const newFilePath = `${destinationPath}/${item.name}${relativePath}`;
                    await client.storage.from(BUCKET_NAME).move(oldFilePath, newFilePath);
                }
            } else { // It's a file
                const newFilePath = `${destinationPath}/${item.name}`;
                await client.storage.from(BUCKET_NAME).move(fromPath, newFilePath);
            }
        }
        
        await ensureFolderExists(currentPath);
        
        refresh();
    };

    useEffect(() => {
        fetchItemsForPath(currentPath);
    }, [currentPath, activeConfig]); // Re-fetch when active config changes

    const setPath = (newPath: string) => {
        if (newPath.startsWith('public')) {
            setCurrentPath(newPath);
        } else {
            setCurrentPath('public');
        }
    };
    
    return (
        <ImageContext.Provider value={{ galleryItems, currentPath, setPath, refresh, loading, uploadFiles, createFolder, deleteFile, deleteFolder, moveItems }}>
            {children}
        </ImageContext.Provider>
    );
};

export const useImages = () => {
    const context = useContext(ImageContext);
    if (context === undefined) {
        throw new Error('useImages must be used within an ImageProvider');
    }
    return context;
};