
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { FolderIcon, XIcon, ChevronRightIcon } from '../Icons';

interface MoveItemsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onMoveConfirm: (destinationPath: string) => void;
    itemsToMove: { name: string, isFolder: boolean }[];
    currentContextPath: string;
}

const MoveItemsModal: React.FC<MoveItemsModalProps> = ({ isOpen, onClose, onMoveConfirm, itemsToMove, currentContextPath }) => {
    const [path, setPath] = useState('public');
    const [folders, setFolders] = useState<{name: string}[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchFolders = async (currentPath: string) => {
        setLoading(true);
        const { data, error } = await supabase.storage.from('property-images').list(currentPath, {
            search: ''
        });
        if (!error && data) {
            setFolders(data.filter(item => item.id === null)); // Only folders
        }
        setLoading(false);
    };
    
    useEffect(() => {
        if (isOpen) {
            const initialPath = 'public';
            setPath(initialPath);
            fetchFolders(initialPath);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            fetchFolders(path);
        }
    }, [path, isOpen]);

    const handleMove = () => {
        const isMovingToSameDirectory = path === currentContextPath;
        const isMovingIntoSelf = itemsToMove.some(item => item.isFolder && path.startsWith(`${currentContextPath}/${item.name}`));

        if (isMovingToSameDirectory) {
            alert("Você não pode mover itens para a mesma pasta onde eles já estão.");
            return;
        }
        if (isMovingIntoSelf) {
            alert("Você não pode mover uma pasta para dentro de si mesma.");
            return;
        }

        onMoveConfirm(path);
    };

    const renderBreadcrumbs = () => {
        const pathSegments = path === 'public' ? [] : path.substring('public/'.length).split('/');
        return (
            <div className="flex items-center text-sm text-slate-600 mb-4 bg-slate-50 p-2 rounded-md">
                <button onClick={() => setPath('public')} className="hover:underline font-medium">Galeria</button>
                {pathSegments.map((segment, index) => {
                    const pathToThisSegment = `public/${pathSegments.slice(0, index + 1).join('/')}`;
                    return (
                        <React.Fragment key={segment}>
                            <ChevronRightIcon className="w-4 h-4 text-slate-400 mx-1" />
                            <button onClick={() => setPath(pathToThisSegment)} className="hover:underline">{segment}</button>
                        </React.Fragment>
                    );
                })}
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col h-[70vh]" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">Mover para...</h2>
                    <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700"><XIcon className="w-6 h-6" /></button>
                </header>

                <main className="flex-1 overflow-y-auto p-4">
                    {renderBreadcrumbs()}
                    {loading ? (
                        <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div></div>
                    ) : (
                        <div className="space-y-2">
                            {folders.length === 0 && <p className="text-slate-500 text-center">Nenhuma subpasta encontrada.</p>}
                            {folders.map(folder => (
                                <div key={folder.name} onClick={() => setPath(`${path}/${folder.name}`)} className="flex items-center p-3 rounded-lg hover:bg-slate-100 cursor-pointer">
                                    <FolderIcon className="w-6 h-6 text-primary-blue mr-3" />
                                    <span className="font-medium text-slate-700">{folder.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
                
                <footer className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end items-center space-x-3">
                    <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-100">Cancelar</button>
                    <button onClick={handleMove} className="px-4 py-2 bg-primary-green text-white font-semibold rounded-lg shadow-md hover:opacity-95">Mover para esta pasta</button>
                </footer>
            </div>
        </div>
    );
};

export default MoveItemsModal;
