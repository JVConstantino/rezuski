
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useImages } from '../../contexts/ImageContext';
import { XIcon, SearchIcon, FolderIcon, FolderPlusIcon, UploadCloudIcon, TrashIcon, MoveIcon } from '../Icons';
import MoveItemsModal from './MoveItemsModal';

interface ItemToMove {
    name: string;
    isFolder: boolean;
}

interface ImageGalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectImages?: (images: string[]) => void;
    onSelectSingleImage?: (imageUrl: string) => void;
    selectionMode?: 'single' | 'multiple';
    currentImages?: string[];
}

const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({
    isOpen,
    onClose,
    onSelectImages,
    onSelectSingleImage,
    selectionMode = 'multiple',
    currentImages = []
}) => {
    const { galleryItems, currentPath, setPath, loading, createFolder, uploadFiles, deleteFile, deleteFolder, moveItems } = useImages();
    
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset state on close
    useEffect(() => {
        if (!isOpen) {
            setSelectedItems([]);
            setSearchTerm('');
        }
    }, [isOpen]);

    const handleToggleSelect = (itemUrlOrName: string) => {
        if (selectionMode === 'multiple') {
            setSelectedItems(prev =>
                prev.includes(itemUrlOrName) ? prev.filter(i => i !== itemUrlOrName) : [...prev, itemUrlOrName]
            );
        }
    };

    const handleItemClick = (item: any) => {
        const isFolder = item.id === null;
        if (isFolder) {
            setPath(`${currentPath}/${item.name}`);
        } else {
            const imageUrl = item.publicUrl;
            if (currentImages.includes(imageUrl)) return;

            if (selectionMode === 'single') {
                if (onSelectSingleImage) onSelectSingleImage(imageUrl);
                onClose();
            } else {
                handleToggleSelect(imageUrl);
            }
        }
    };
    
    const handleConfirm = () => {
        if (onSelectImages) onSelectImages(selectedItems);
        onClose();
    };

    const handleCreateFolder = () => {
        const folderName = prompt('Digite o nome da nova pasta:');
        if (folderName) createFolder(folderName);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) uploadFiles(e.target.files, currentPath);
    };

    const getSelectedItemsData = (): ItemToMove[] => {
        return selectedItems.map(nameOrUrl => {
            const item = galleryItems.find(i => i.name === nameOrUrl || i.publicUrl === nameOrUrl);
            return {
                name: item.name,
                isFolder: item.id === null,
            };
        });
    };

    const handleBulkDelete = () => {
        const itemsToDelete = getSelectedItemsData();
        if (window.confirm(`Tem certeza que deseja excluir ${itemsToDelete.length} item(ns) selecionado(s)?`)) {
            itemsToDelete.forEach(item => {
                const path = `${currentPath}/${item.name}`;
                if (item.isFolder) deleteFolder(path);
                else deleteFile(path);
            });
            setSelectedItems([]);
        }
    };

    const handleMoveConfirm = (destinationPath: string) => {
        const itemsToMove = getSelectedItemsData();
        moveItems(itemsToMove, destinationPath);
        setSelectedItems([]);
    };

    const renderBreadcrumbs = () => {
        const pathSegments = currentPath === 'public' ? [] : currentPath.substring('public/'.length).split('/');
        return (
            <div className="flex items-center text-sm text-slate-600 truncate">
                <button onClick={() => setPath('public')} className="hover:underline font-medium flex-shrink-0">Galeria</button>
                {pathSegments.map((segment, index) => {
                    const pathToThisSegment = `public/${pathSegments.slice(0, index + 1).join('/')}`;
                    return (
                        <React.Fragment key={segment}>
                            <span className="mx-2 text-slate-400">/</span>
                            <button onClick={() => setPath(pathToThisSegment)} className="hover:underline truncate">{segment}</button>
                        </React.Fragment>
                    );
                })}
            </div>
        );
    };

    if (!isOpen) return null;

    const filteredItems = galleryItems.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const selectableItems = useMemo(() => {
        return filteredItems.filter(item => {
            const isFolder = item.id === null;
            if (isFolder) return false; 
            if (currentImages.includes(item.publicUrl)) return false;
            return true;
        });
    }, [filteredItems, currentImages]);

    const allSelectableSelected = useMemo(() => {
        if (selectableItems.length === 0) return false;
        const selectableUrls = selectableItems.map(item => item.publicUrl);
        return selectableUrls.every(url => selectedItems.includes(url));
    }, [selectableItems, selectedItems]);

    const handleSelectAll = () => {
        const selectableUrls = selectableItems.map(item => item.publicUrl);
        if (allSelectableSelected) {
            setSelectedItems(prev => prev.filter(url => !selectableUrls.includes(url)));
        } else {
            setSelectedItems(prev => [...new Set([...prev, ...selectableUrls])]);
        }
    };

    const showActionsBar = selectionMode === 'multiple' && selectedItems.length > 0;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">Galeria de Mídia</h2>
                    <div className="flex items-center space-x-2">
                         <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700"><XIcon className="w-6 h-6" /></button>
                    </div>
                </header>
                
                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4 flex-grow w-full sm:w-auto">
                        <div className="relative flex-grow max-w-xs">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><SearchIcon className="w-5 h-5 text-slate-400" /></span>
                            <input type="text" placeholder="Buscar na pasta..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg"/>
                        </div>
                        {selectionMode === 'multiple' && (
                             <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="selectAllModal"
                                    checked={allSelectableSelected}
                                    onChange={handleSelectAll}
                                    className="h-5 w-5 rounded text-primary-blue focus:ring-primary-blue border-slate-300"
                                    disabled={selectableItems.length === 0}
                                />
                                <label htmlFor="selectAllModal" className="ml-2 text-sm font-medium text-slate-600">
                                    Selecionar Todos
                                </label>
                            </div>
                        )}
                    </div>
                    <div className="w-full sm:w-auto truncate">{renderBreadcrumbs()}</div>
                </div>

                {showActionsBar && (
                    <div className="p-2 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
                        <span className="text-sm font-semibold text-slate-700">{selectedItems.length} item(ns) selecionado(s)</span>
                        <div className="flex items-center space-x-2">
                             <button onClick={() => setIsMoveModalOpen(true)} className="flex items-center text-slate-600 hover:text-primary-blue p-2 rounded-md text-sm"><MoveIcon className="w-4 h-4 mr-1"/> Mover</button>
                             <button onClick={handleBulkDelete} className="flex items-center text-slate-600 hover:text-red-600 p-2 rounded-md text-sm"><TrashIcon className="w-4 h-4 mr-1"/> Deletar</button>
                             <button onClick={() => setSelectedItems([])} className="text-primary-blue text-sm font-semibold hover:underline">Limpar</button>
                        </div>
                    </div>
                )}

                <main className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                         <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div></div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                            {filteredItems.map((item) => {
                                const isFolder = item.id === null;
                                const id = isFolder ? item.name : item.publicUrl;
                                const isSelected = selectedItems.includes(id);
                                const isAlreadyOnProperty = !isFolder && currentImages.includes(item.publicUrl);
                                const isDisabled = isAlreadyOnProperty && selectionMode === 'multiple';

                                return (
                                    <div key={id} className="relative group aspect-square">
                                        <div onClick={() => handleItemClick(item)} className={`w-full h-full rounded-lg border-2 flex items-center justify-center p-2 text-center transition-all ${isSelected ? 'border-primary-blue' : 'border-slate-200'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary-blue/50'}`}>
                                            {isFolder ? (
                                                <div className="flex flex-col items-center">
                                                    <FolderIcon className="w-16 h-16 text-primary-blue" />
                                                    <p className="mt-2 text-sm font-medium text-slate-700 break-all">{item.name}</p>
                                                </div>
                                            ) : (
                                                <img src={item.publicUrl} alt={item.name} className="w-full h-full object-cover rounded-md" />
                                            )}
                                        </div>
                                        {selectionMode === 'multiple' && !isDisabled && !isFolder &&(
                                            <input type="checkbox" checked={isSelected} onChange={() => handleToggleSelect(id)} className="absolute top-2 left-2 h-5 w-5 rounded text-primary-blue focus:ring-primary-blue cursor-pointer"/>
                                        )}
                                        {isDisabled && <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center"><span className="text-white text-xs font-bold text-center">Já adicionada</span></div>}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>

                <footer className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                     <div>
                        <button onClick={handleCreateFolder} className="flex items-center bg-white border border-slate-300 text-slate-700 font-semibold py-2 px-3 rounded-lg shadow-sm hover:bg-slate-50 text-sm"><FolderPlusIcon className="w-4 h-4 mr-2" /> Pasta</button>
                    </div>
                     <div className="flex items-center space-x-3">
                        <button onClick={() => fileInputRef.current?.click()} className="flex items-center bg-primary-blue text-white font-semibold py-2 px-3 rounded-lg shadow-sm hover:opacity-95 text-sm"><UploadCloudIcon className="w-4 h-4 mr-2" /> Enviar</button>
                        <input type="file" multiple ref={fileInputRef} onChange={handleFileUpload} className="hidden" />

                        {selectionMode === 'multiple' && (
                            <button onClick={handleConfirm} disabled={selectedItems.length === 0} className="px-4 py-2 bg-primary-green text-white font-semibold rounded-lg shadow-md hover:opacity-95 disabled:opacity-50">
                                Confirmar Seleção
                            </button>
                        )}
                    </div>
                </footer>
            </div>
            <MoveItemsModal
                isOpen={isMoveModalOpen}
                onClose={() => setIsMoveModalOpen(false)}
                onMoveConfirm={handleMoveConfirm}
                itemsToMove={getSelectedItemsData()}
                currentContextPath={currentPath}
            />
        </div>
    );
};

export default ImageGalleryModal;
