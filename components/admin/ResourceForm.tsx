

import React, { useState, useEffect } from 'react';
import { ResourceDocument } from '../../types';
import { FileTextIcon } from '../Icons';
import { dummyPdfUrl } from '../../constants';

interface ResourceFormProps {
    initialData?: ResourceDocument;
    onSubmit: (data: Omit<ResourceDocument, 'id'>) => void;
    isEditing: boolean;
}

const ResourceForm: React.FC<ResourceFormProps> = ({ initialData, onSubmit, isEditing }) => {
    const [title, setTitle] = useState('');
    const [fileUrl, setFileUrl] = useState('');
    const [fileName, setFileName] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    
    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setFileUrl(initialData.fileUrl);
            const existingFileName = initialData.fileUrl.split('/').pop();
            setFileName(existingFileName || 'Arquivo existente.');
        }
    }, [initialData]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type !== 'application/pdf') {
                alert('Por favor, selecione um arquivo PDF.');
                return;
            }
            setIsUploading(true);
            setFileName(`Enviando ${file.name}...`);
            
            // Simulate upload delay and use a dummy URL
            setTimeout(() => {
                setFileUrl(dummyPdfUrl);
                setFileName(file.name);
                setIsUploading(false);
            }, 1000);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            alert('Por favor, preencha o título.');
            return;
        }
        if (!fileUrl) {
            alert('Por favor, selecione um arquivo PDF.');
            return;
        }
        onSubmit({ title, fileUrl });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-sm max-w-2xl">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700">Título do Documento</label>
                <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"
                    placeholder="Ex: Manual do Locatário"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Arquivo PDF</label>
                <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                        <FileTextIcon className="mx-auto h-12 w-12 text-slate-400" />
                        <div className="flex text-sm text-slate-600">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-blue hover:text-primary-blue/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-blue">
                                <span>Selecione um arquivo</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="application/pdf" disabled={isUploading} />
                            </label>
                            <p className="pl-1">ou arraste e solte.</p>
                        </div>
                        <p className="text-xs text-slate-500">Apenas PDF.</p>
                    </div>
                </div>
                {fileName && (
                    <div className="mt-2 text-sm text-slate-700">
                        <p>Arquivo: <span className="font-medium">{fileName}</span></p>
                    </div>
                )}
            </div>
            <div className="pt-5">
                <div className="flex justify-end">
                    <button type="button" onClick={() => window.history.back()} className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50">Cancelar</button>
                    <button type="submit" disabled={isUploading} className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-green hover:opacity-95 disabled:opacity-50">
                        {isUploading ? 'Enviando...' : (isEditing ? 'Salvar Alterações' : 'Adicionar Recurso')}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default ResourceForm;