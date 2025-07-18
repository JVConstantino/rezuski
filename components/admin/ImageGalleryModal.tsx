

import React, { useState, useRef } from 'react';
import { useImages } from '../../contexts/ImageContext';
import { XIcon, SearchIcon, FolderIcon, FolderPlusIcon, UploadCloudIcon } from '../Icons';

interface ImageGalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectImages: (images: string[]) => void;
    currentImages: string[];
}

const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({ isOpen, onClose, onSelectImages, currentImages }) => {
    const { galleryItems, currentPath, setPath, loading, createFolder, uploadFiles } = useImages();
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleToggleSelect = (image: string) => {
        if (currentImages.includes(image)) return;
        setSelectedImages(prev =>
            prev.includes(image) ? prev.filter(i => i !== image) : [...prev, image]
        );
    };

    const handleConfirm = () => {
        onSelectImages(selectedImages);
        onClose();
    };

    const handleFolderClick = (folderName: string) => {
        const newPath = `${currentPath}/${folderName}`;
        setPath(newPath);
    };

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
    
    const renderBreadcrumbs = () => {
        const pathSegments = currentPath === 'public' ? [] : currentPath.substring('public/'.length).split('/');
        
        return (
            <div className="flex items-center text-sm text-slate-600">
                <button onClick={() => setPath('public')} className="hover:underline font-medium">Galeria</button>
                {pathSegments.map((segment, index) => {
                    const pathToThisSegment = `public/${pathSegments.slice(0, index + 1).join('/')}`;
                    return (
                        <React.Fragment key={segment}>
                            <span className="mx-2 text-slate-400">/</span>
                            <button
                                onClick={() => setPath(pathToThisSegment)}
                                className="hover:underline"
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
        <div
            className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 transition-opacity"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="p-4 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">Galeria de Imagens</h2>
                    <div className="flex items-center space-x-2">
                        <button onClick={handleCreateFolder} className="flex items-center bg-white border border-slate-300 text-slate-700 font-semibold py-2 px-3 rounded-lg shadow-sm hover:bg-slate-50 text-xs">
                            <FolderPlusIcon className="w-4 h-4 mr-2" />
                            Criar Pasta
                        </button>
                        <button onClick={() => fileInputRef.current?.click()} className="flex items-center bg-primary-blue text-white font-semibold py-2 px-3 rounded-lg shadow-sm hover:opacity-95 text-xs">
                            <UploadCloudIcon className="w-4 h-4 mr-2" />
                            Enviar
                        </button>
                        <input type="file" multiple ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                        <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                </header>
                
                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                     <div className="relative w-full sm:w-auto sm:flex-grow">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <SearchIcon className="w-5 h-5 text-slate-400" />
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar na pasta atual..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-primary-blue focus:border-primary-blue"
                        />
                    </div>
                    {renderBreadcrumbs()}
                </div>

                <main className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                         <div className="flex justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                            {filteredItems.map((item, index) => {
                                const isFolder = item.id === null;

                                if (isFolder) {
                                    return (
                                        <div
                                            key={item.name}
                                            onClick={() => handleFolderClick(item.name)}
                                            className="relative rounded-lg overflow-hidden cursor-pointer group aspect-square bg-slate-100 hover:bg-slate-200 flex flex-col items-center justify-center p-2 transition-colors"
                                        >
                                            <FolderIcon className="w-16 h-16 text-primary-blue" />
                                            <p className="mt-2 text-sm font-medium text-slate-700 text-center truncate w-full">{item.name}</p>
                                        </div>
                                    )
                                }

                                const imageUrl = item.publicUrl;
                                const isSelected = selectedImages.includes(imageUrl);
                                const isAlreadyOnProperty = currentImages.includes(imageUrl);

                                return (
                                    <div
                                        key={imageUrl}
                                        className={`relative rounded-lg overflow-hidden cursor-pointer group aspect-square
                                            ${isAlreadyOnProperty ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}
                                            ${isSelected ? 'ring-4 ring-primary-blue' : ''}
                                        `}
                                        onClick={() => !isAlreadyOnProperty && handleToggleSelect(imageUrl)}
                                    >
                                        <img src={imageUrl} alt={`Imagem da galeria ${index}`} className="w-full h-full object-cover" />
                                        {isAlreadyOnProperty && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <span className="text-white text-xs font-bold text-center">Já adicionada</span>
                                            </div>
                                        )}
                                        {isSelected && (
                                            <div className="absolute inset-0 bg-primary-blue/50 flex items-center justify-center">
                                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </main>

                <footer className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end items-center space-x-3">
                    <span className="text-sm text-slate-600">{selectedImages.length} imagem(ns) selecionada(s)</span>
                    <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-100">
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={selectedImages.length === 0}
                        className="px-4 py-2 bg-primary-green text-white font-semibold rounded-lg shadow-md hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Confirmar Seleção
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default ImageGalleryModal;