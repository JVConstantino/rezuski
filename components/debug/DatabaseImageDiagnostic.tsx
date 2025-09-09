import React, { useEffect, useState } from 'react';
import { useDatabaseConfig } from '../../contexts/DatabaseConfigContext';
import { useStorageConfig } from '../../contexts/StorageConfigContext';
import { useImages } from '../../contexts/ImageContext';
import { useAuth } from '../../contexts/AuthContext';

interface DiagnosticLog {
    timestamp: string;
    event: string;
    databaseConfig: any;
    storageConfig: any;
    imageContext: any;
}

const DatabaseImageDiagnostic: React.FC = () => {
    const { user } = useAuth();
    const databaseContext = useDatabaseConfig();
    const storageContext = useStorageConfig();
    const imageContext = useImages();
    const [logs, setLogs] = useState<DiagnosticLog[]>([]);
    const [isVisible, setIsVisible] = useState(false);

    // Só permite acesso para o usuário específico
    if (!user || user.email !== 'joaovictor.priv@gmail.com') {
        return null;
    }

    const addLog = (event: string) => {
        const log: DiagnosticLog = {
            timestamp: new Date().toISOString(),
            event,
            databaseConfig: {
                activeId: databaseContext.activeConfig?.id,
                activeUrl: databaseContext.activeConfig?.database_url,
                configsCount: databaseContext.configs.length,
                loading: databaseContext.loading
            },
            storageConfig: {
                activeId: storageContext.activeConfig?.id,
                activeUrl: storageContext.activeConfig?.storage_url,
                activeBucket: storageContext.activeConfig?.bucket_name,
                configsCount: storageContext.configs.length,
                loading: storageContext.loading
            },
            imageContext: {
                currentPath: imageContext.currentPath,
                itemsCount: imageContext.galleryItems.length,
                loading: imageContext.loading
            }
        };
        
        setLogs(prev => [log, ...prev.slice(0, 9)]); // Keep only last 10 logs
    };

    useEffect(() => {
        addLog('Database Config Changed');
    }, [databaseContext.activeConfig]);

    useEffect(() => {
        addLog('Storage Config Changed');
    }, [storageContext.activeConfig]);

    useEffect(() => {
        addLog('Image Context Changed');
    }, [imageContext.galleryItems.length, imageContext.currentPath]);

    const testImageDisplay = async () => {
        addLog('Testing Image Display');
        
        // Force refresh image context
        imageContext.refresh();
        
        // Log current configurations
        console.log('=== IMAGE DISPLAY DIAGNOSTIC ===');
        console.log('Active Database:', databaseContext.activeConfig);
        console.log('Active Storage:', storageContext.activeConfig);
        console.log('Current Images:', imageContext.galleryItems);
        console.log('================================');
    };

    if (!isVisible) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <button
                    onClick={() => setIsVisible(true)}
                    className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-600"
                >
                    🔍 Debug Images
                </button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
            <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h3 className="font-medium text-sm">Database → Image Diagnostic</h3>
                <div className="flex space-x-2">
                    <button
                        onClick={testImageDisplay}
                        className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    >
                        Test
                    </button>
                    <button
                        onClick={() => setLogs([])}
                        className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                    >
                        Clear
                    </button>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                        ✕
                    </button>
                </div>
            </div>
            
            <div className="p-3">
                <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                    <div className="bg-blue-50 p-2 rounded">
                        <strong>DB:</strong> {databaseContext.activeConfig?.id || 'None'}
                        <br />
                        <span className="text-gray-600">{databaseContext.loading ? 'Loading...' : 'Ready'}</span>
                    </div>
                    <div className="bg-green-50 p-2 rounded">
                        <strong>Storage:</strong> {storageContext.activeConfig?.id || 'None'}
                        <br />
                        <span className="text-gray-600">{storageContext.loading ? 'Loading...' : 'Ready'}</span>
                    </div>
                    <div className="bg-purple-50 p-2 rounded">
                        <strong>Images:</strong> {imageContext.galleryItems.length}
                        <br />
                        <span className="text-gray-600">{imageContext.loading ? 'Loading...' : 'Ready'}</span>
                    </div>
                </div>
            </div>

            <div className="max-h-48 overflow-y-auto border-t border-gray-200">
                {logs.length === 0 ? (
                    <div className="p-3 text-center text-gray-500 text-sm">No events logged yet</div>
                ) : (
                    logs.map((log, index) => (
                        <div key={index} className="p-2 border-b border-gray-100 text-xs">
                            <div className="font-medium text-gray-800">{log.event}</div>
                            <div className="text-gray-500 text-xs">
                                {new Date(log.timestamp).toLocaleTimeString()}
                            </div>
                            <div className="mt-1 grid grid-cols-3 gap-1 text-xs">
                                <div>DB: {log.databaseConfig.activeId}</div>
                                <div>St: {log.storageConfig.activeId}</div>
                                <div>Img: {log.imageContext.itemsCount}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DatabaseImageDiagnostic;