

import React, { useState } from 'react';
import { useImages } from '../../contexts/ImageContext';
import { XIcon, SearchIcon } from '../Icons';

interface ImageGalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectImages: (images: string[]) => void;
    currentImages: string[];
}

const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({ isOpen, onClose, onSelectImages, currentImages }) => {
    const { galleryImages } = useImages();
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    if (!isOpen) return null;

    const handleToggleSelect = (image: string) => {
        if (currentImages.includes(image)) return; // Don't allow re-selecting images already on the property
        
        setSelectedImages(prev =>
            prev.includes(image) ? prev.filter(i => i !== image) : [...prev, image]
        );
    };

    const handleConfirm = () => {
        onSelectImages(selectedImages);
        onClose();
    };

    const filteredImages = galleryImages.filter(image =>
        image.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div
            className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 transition-opacity"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="p-4 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">Galeria de Imagens</h2>
                    <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
                        <XIcon className="w-6 h-6" />
                    </button>
                </header>
                
                <div className="p-4 border-b border-slate-200">
                     <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <SearchIcon className="w-5 h-5 text-slate-400" />
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar imagem..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-primary-blue focus:border-primary-blue"
                        />
                    </div>
                </div>

                <main className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                        {filteredImages.map((image, index) => {
                            const isSelected = selectedImages.includes(image);
                            const isAlreadyOnProperty = currentImages.includes(image);

                            return (
                                <div
                                    key={index}
                                    className={`relative rounded-lg overflow-hidden cursor-pointer group aspect-square
                                        ${isAlreadyOnProperty ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}
                                        ${isSelected ? 'ring-4 ring-primary-blue' : ''}
                                    `}
                                    onClick={() => handleToggleSelect(image)}
                                >
                                    <img src={image} alt={`Imagem da galeria ${index}`} className="w-full h-full object-cover" />
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
