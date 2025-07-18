
import React, { useState, useRef } from 'react';
import { useImages } from '../../contexts/ImageContext';
import { FolderIcon, TrashIcon, FolderPlusIcon, UploadCloudIcon, SearchIcon, ChevronRightIcon } from '../../components/Icons';

const GalleryPage: React.FC = () => {
    const { 
        galleryItems, 
        currentPath, 
        setPath, 
        loading, 
        uploadFiles, 
        createFolder, 
        deleteFile, 
        deleteFolder 
    } = useImages();
    
    const [searchTerm, setSearchTerm] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCreateFolder = () => {
        const folderName = prompt('Digite o nome da nova pasta:');
        if (folderName) {
            createFolder(folderName);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            uploadFiles(e.target.files, currentPath);
        }
    };
    
    const handleDeleteFile = (item: any) => {
        const filePath = `${currentPath}/${item.name}`;
        if (window.confirm(`Tem certeza que deseja excluir o arquivo "${item.name}"?`)) {
            deleteFile(filePath);
        }
    };

    const handleDeleteFolder = (item: any) => {
        const folderPath = `${currentPath}/${item.name}`;
        if (window.confirm(`Tem certeza que deseja excluir a pasta "${item.name}" e todo o seu conteúdo? Esta ação não pode ser desfeita.`)) {
            deleteFolder(folderPath);
        }
    };

    const renderBreadcrumbs = () => {
        const pathSegments = currentPath === 'public' ? [] : currentPath.substring('public/'.length).split('/');
        
        return (
            <div className="flex items-center text-sm text-slate-600">
                <button onClick={() => setPath('public')} className="hover:text-primary-blue">Galeria</button>
                {pathSegments.map((segment, index) => {
                    const pathToThisSegment = `public/${pathSegments.slice(0, index + 1).join('/')}`;
                    return (
                        <React.Fragment key={segment}>
                            <ChevronRightIcon className="w-4 h-4 text-slate-400 mx-1" />
                            <button
                                onClick={() => setPath(pathToThisSegment)}
                                className="hover:text-primary-blue"
                            >
                                {segment}
                            </button>
                        </React.Fragment>
                    );
                })}
            </div>
        );
    };

    const filteredItems = galleryItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Galeria de Mídia</h1>
                    <div className="mt-2">{renderBreadcrumbs()}</div>
                </div>
                <div className="flex items-center space-x-3">
                    <button onClick={handleCreateFolder} className="flex items-center bg-white border border-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
                        <FolderPlusIcon className="w-5 h-5 mr-2" />
                        Criar Pasta
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center bg-primary-green text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:opacity-95 transition-all">
                        <UploadCloudIcon className="w-5 h-5 mr-2" />
                        Enviar Arquivos
                    </button>
                    <input type="file" multiple ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="relative mb-4">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <SearchIcon className="w-5 h-5 text-slate-400" />
                    </span>
                    <input
                      type="text"
                      placeholder="Buscar na pasta atual..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full md:w-1/3 pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-primary-blue focus:border-primary-blue"
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {filteredItems.map((item, index) => {
                            const isFolder = item.id === null;

                            return (
                                <div key={item.name + index} className="relative group aspect-square rounded-lg border border-slate-200 shadow-sm transition-all hover:shadow-md">
                                    {isFolder ? (
                                        <div
                                            onClick={() => setPath(`${currentPath}/${item.name}`)}
                                            className="w-full h-full cursor-pointer bg-slate-50 hover:bg-slate-100 flex flex-col items-center justify-center p-2 rounded-lg"
                                        >
                                            <FolderIcon className="w-16 h-16 text-primary-blue" />
                                            <p className="mt-2 text-sm font-medium text-slate-700 text-center truncate w-full">{item.name}</p>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full">
                                            <img src={item.publicUrl} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 rounded-b-lg">
                                                <p className="text-xs font-medium text-white text-center truncate w-full">{item.name}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => isFolder ? handleDeleteFolder(item) : handleDeleteFile(item)} 
                                            className="p-1.5 bg-white/80 hover:bg-white text-red-600 rounded-full shadow-md"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                 {!loading && filteredItems.length === 0 && (
                    <div className="text-center py-16 text-slate-500">
                        <p>Esta pasta está vazia.</p>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default GalleryPage;
