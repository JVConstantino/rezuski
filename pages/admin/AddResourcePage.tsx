

import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useResources } from '../../contexts/ResourceContext';
import ResourceForm from '../../components/admin/ResourceForm';
import { ResourceDocument } from '../../types';
import { ChevronLeftIcon } from '../../components/Icons';

const AddResourcePage: React.FC = () => {
    const { addResource } = useResources();
    const navigate = ReactRouterDOM.useNavigate();

    const handleSubmit = async (data: Omit<ResourceDocument, 'id'>) => {
        await addResource(data);
        navigate('/admin/resources');
    };

    return (
        <div>
            <ReactRouterDOM.Link to="/admin/resources" className="flex items-center text-sm text-slate-600 hover:text-primary-blue font-semibold mb-2">
                <ChevronLeftIcon className="w-5 h-5 mr-1" />
                Voltar para Recursos
            </ReactRouterDOM.Link>
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Adicionar Novo Recurso</h1>
            <ResourceForm onSubmit={handleSubmit} isEditing={false} />
        </div>
    );
};

export default AddResourcePage;