
import React, { useState, useRef, useMemo } from 'react';
import { useImages } from '../../contexts/ImageContext';
import { FolderIcon, TrashIcon, FolderPlusIcon, UploadCloudIcon, SearchIcon, ChevronRightIcon, MoveIcon } from '../../components/Icons';
import MoveItemsModal from '../../components/admin/MoveItemsModal';

interface ItemToMove {
    name: string;
    isFolder: boolean;
}

const GalleryPage: React.FC = () => {
    const { galleryItems, currentPath, setPath, loading, uploadFiles, createFolder, deleteFile, deleteFolder, moveItems } = useImages();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const filteredItems = galleryItems.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleCreateFolder = () => {
        const folderName = prompt('Digite o nome da nova pasta:');
        if (folderName) createFolder(folderName);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) uploadFiles(e.target.files, currentPath);
    };

    const handleToggleSelect = (itemName: string) => {
        setSelectedItems(prev => prev.includes(itemName) ? prev.filter(name => name !== itemName) : [...prev, itemName]);
    };
    
    const getSelectedItemsData = (): ItemToMove[] => {
        return selectedItems.map(itemName => {
            const item = galleryItems.find(i => i.name === itemName);
            return {
                name: item.name,
                isFolder: item.id === null,
            };
        });
    };

    const handleBulkDelete = () => {
        const itemsToDelete = getSelectedItemsData();
        if (window.confirm(`Tem certeza que deseja excluir ${itemsToDelete.length} item(ns) selecionado(s)? Esta ação não pode ser desfeita.`)) {
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
            <div className="flex items-center text-sm text-slate-600">
                <button onClick={() => { setSelectedItems([]); setPath('public'); }} className="hover:text-primary-blue">Galeria</button>
                {pathSegments.map((segment, index) => {
                    const pathToThisSegment = `public/${pathSegments.slice(0, index + 1).join('/')}`;
                    return (
                        <React.Fragment key={pathToThisSegment}>
                            <ChevronRightIcon className="w-4 h-4 text-slate-400 mx-1" />
                            <button onClick={() => { setSelectedItems([]); setPath(pathToThisSegment); }} className="hover:text-primary-blue">{segment}</button>
                        </React.Fragment>
                    );
                })}
            </div>
        );
    };
    
    const allVisibleSelected = useMemo(() => {
        if (filteredItems.length === 0) return false;
        return filteredItems.every(item => selectedItems.includes(item.name));
    }, [filteredItems, selectedItems]);

    const handleSelectAll = () => {
        if (allVisibleSelected) {
            setSelectedItems([]);
        } else {
            setSelectedItems(filteredItems.map(item => item.name));
        }
    };


    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Galeria de Mídia</h1>
                    <div className="mt-2">{renderBreadcrumbs()}</div>
                </div>
                <div className="flex items-center space-x-3">
                    <button onClick={handleCreateFolder} className="flex items-center bg-white border border-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-slate-50"><FolderPlusIcon className="w-5 h-5 mr-2" /> Criar Pasta</button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center bg-primary-green text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:opacity-95"><UploadCloudIcon className="w-5 h-5 mr-2" /> Enviar Arquivos</button>
                    <input type="file" multiple ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><SearchIcon className="w-5 h-5 text-slate-400" /></span>
                            <input type="text" placeholder="Buscar na pasta atual..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-80 pl-10 pr-4 py-2 border border-slate-300 rounded-lg"/>
                        </div>
                         <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="selectAll"
                                checked={allVisibleSelected}
                                onChange={handleSelectAll}
                                className="h-5 w-5 rounded text-primary-blue focus:ring-primary-blue border-slate-300"
                                disabled={filteredItems.length === 0}
                            />
                            <label htmlFor="selectAll" className="ml-2 text-sm font-medium text-slate-600">
                                Selecionar Todos
                            </label>
                        </div>
                    </div>
                    {selectedItems.length > 0 && (
                        <div className="flex items-center space-x-2 p-2 bg-slate-100 rounded-lg">
                            <span className="text-sm font-semibold text-slate-700">{selectedItems.length} selecionado(s)</span>
                            <button onClick={() => setIsMoveModalOpen(true)} className="flex items-center text-slate-600 hover:text-primary-blue p-2 rounded-md text-sm"><MoveIcon className="w-4 h-4 mr-1"/> Mover</button>
                            <button onClick={handleBulkDelete} className="flex items-center text-slate-600 hover:text-red-600 p-2 rounded-md text-sm"><TrashIcon className="w-4 h-4 mr-1"/> Deletar</button>
                            <button onClick={() => setSelectedItems([])} className="text-primary-blue text-sm font-semibold hover:underline">Limpar</button>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div></div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {filteredItems.map((item) => {
                            const isFolder = item.id === null;
                            const itemKey = isFolder ? `folder-${item.name}` : `file-${item.id!}`;
                            const isSelected = selectedItems.includes(item.name);
                            return (
                                <div key={itemKey} className={`relative group aspect-square rounded-lg border-2 transition-all ${isSelected ? 'border-primary-blue shadow-lg' : 'border-slate-200'}`}>
                                    <div
                                        onClick={() => isFolder && setPath(`${currentPath}/${item.name}`)}
                                        className={`w-full h-full flex flex-col items-center justify-center p-2 text-center ${isFolder ? 'cursor-pointer bg-slate-50 hover:bg-slate-100' : ''}`}
                                    >
                                        {isFolder ? <FolderIcon className="w-16 h-16 text-primary-blue" /> : <img src={item.publicUrl} alt={item.name} className="w-full h-full object-cover rounded-md" />}
                                    </div>
                                    <div className={`absolute bottom-0 left-0 right-0 p-2 text-center rounded-b-lg ${isFolder ? '' : 'bg-gradient-to-t from-black/70 to-transparent'}`}>
                                        <p className={`text-xs font-medium truncate w-full ${isFolder ? 'text-slate-700' : 'text-white'}`}>{item.name}</p>
                                    </div>
                                    <div className="absolute top-1 left-1">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => handleToggleSelect(item.name)}
                                            className="h-5 w-5 rounded text-primary-blue focus:ring-primary-blue border-slate-300 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                {!loading && filteredItems.length === 0 && (
                    <div className="text-center py-16 text-slate-500"><p>Esta pasta está vazia.</p></div>
                )}
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

export default GalleryPage;
