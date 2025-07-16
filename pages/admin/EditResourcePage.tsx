

import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useResources } from '../../contexts/ResourceContext';
import ResourceForm from '../../components/admin/ResourceForm';
import { ResourceDocument } from '../../types';
import { ChevronLeftIcon } from '../../components/Icons';

const EditResourcePage: React.FC = () => {
    const { resourceId } = ReactRouterDOM.useParams<{ resourceId: string }>();
    const { resources, updateResource } = useResources();
    const navigate = ReactRouterDOM.useNavigate();

    const resourceToEdit = resources.find(r => r.id === resourceId);

    const handleSubmit = async (data: Omit<ResourceDocument, 'id'>) => {
        if (resourceToEdit) {
            const updatedResource = { ...resourceToEdit, ...data };
            await updateResource(updatedResource);
            navigate('/admin/resources');
        }
    };

    if (!resourceToEdit) {
        return <div className="text-center p-8">Recurso não encontrado.</div>;
    }

    return (
        <div>
            <ReactRouterDOM.Link to="/admin/resources" className="flex items-center text-sm text-slate-600 hover:text-primary-blue font-semibold mb-2">
                <ChevronLeftIcon className="w-5 h-5 mr-1" />
                Voltar para Recursos
            </ReactRouterDOM.Link>
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Editar Recurso</h1>
            <ResourceForm initialData={resourceToEdit} onSubmit={handleSubmit} isEditing={true} />
        </div>
    );
};

export default EditResourcePage;