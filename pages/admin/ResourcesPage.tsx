
import React from 'react';
import { Link } from 'react-router-dom';
import { useResources } from '../../contexts/ResourceContext';
import { PlusIcon, EditIcon, TrashIcon, FileTextIcon } from '../../components/Icons';

const AdminResourcesPage: React.FC = () => {
    const { resources, deleteResource } = useResources();

    const handleDelete = (id: string, title: string) => {
        if (window.confirm(`Tem certeza que deseja remover o documento "${title}"?`)) {
            deleteResource(id);
        }
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-slate-900">Gerenciar Recursos</h1>
                <Link to="/admin/resources/new" className="flex items-center bg-primary-green text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:opacity-95 transition-all duration-200">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Adicionar Recurso
                </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
                {/* Mobile View */}
                <div className="md:hidden space-y-3">
                    {resources.map(resource => (
                        <div key={resource.id} className="bg-white p-4 rounded-lg shadow-sm border flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <FileTextIcon className="w-5 h-5 text-primary-blue flex-shrink-0" />
                                <p className="font-semibold text-slate-800">{resource.title}</p>
                            </div>
                            <div className="flex space-x-1 flex-shrink-0 ml-2">
                                <Link to={`/admin/resources/edit/${resource.id}`} className="p-2 text-slate-500 hover:text-primary-blue rounded-md hover:bg-slate-100" title="Editar">
                                    <EditIcon className="w-5 h-5" />
                                </Link>
                                <button onClick={() => handleDelete(resource.id, resource.title)} className="p-2 text-slate-500 hover:text-red-600 rounded-md hover:bg-slate-100" title="Remover">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="p-4 font-semibold text-slate-600">Título do Documento</th>
                                <th className="p-4 font-semibold text-slate-600 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resources.map(resource => (
                                <tr key={resource.id} className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="p-4">
                                        <div className="flex items-center space-x-3">
                                            <FileTextIcon className="w-5 h-5 text-primary-blue" />
                                            <p className="font-semibold text-slate-800">{resource.title}</p>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-center space-x-2">
                                            <Link to={`/admin/resources/edit/${resource.id}`} className="p-2 text-slate-500 hover:text-primary-blue rounded-md hover:bg-slate-100" title="Editar">
                                                <EditIcon className="w-5 h-5" />
                                            </Link>
                                            <button onClick={() => handleDelete(resource.id, resource.title)} className="p-2 text-slate-500 hover:text-red-600 rounded-md hover:bg-slate-100" title="Remover">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {resources.length === 0 && (
                    <div className="text-center py-10 text-slate-500">
                        <p>Nenhum recurso encontrado.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminResourcesPage;
