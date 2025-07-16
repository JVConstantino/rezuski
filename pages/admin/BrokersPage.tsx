

import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useBrokers } from '../../contexts/BrokerContext';
import { PlusIcon, EditIcon, TrashIcon } from '../../components/Icons';

const BrokersPage: React.FC = () => {
    const { brokers, deleteBroker } = useBrokers();

    const handleDelete = (id: string) => {
        if (window.confirm('Tem certeza que deseja remover este corretor?')) {
            deleteBroker(id);
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-900">Gerenciar Corretores</h1>
                <ReactRouterDOM.Link to="/admin/brokers/new" className="flex items-center bg-primary-green text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:opacity-95 transition-all duration-200">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Adicionar Corretor
                </ReactRouterDOM.Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="p-4 font-semibold text-slate-600">Corretor</th>
                                <th className="p-4 font-semibold text-slate-600">Cargo</th>
                                <th className="p-4 font-semibold text-slate-600">Contato</th>
                                <th className="p-4 font-semibold text-slate-600 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {brokers.map(broker => (
                                <tr key={broker.id} className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="p-4">
                                        <div className="flex items-center space-x-3">
                                            <img src={broker.avatarUrl} alt={broker.name} className="w-12 h-12 rounded-full object-cover" />
                                            <div>
                                                <p className="font-semibold text-slate-800">{broker.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-600">{broker.title}</td>
                                    <td className="p-4">
                                        <p className="text-sm text-slate-800">{broker.email}</p>
                                        <p className="text-sm text-slate-500">{broker.phone}</p>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-center space-x-2">
                                            <ReactRouterDOM.Link to={`/admin/brokers/edit/${broker.id}`} className="p-2 text-slate-500 hover:text-primary-blue rounded-md hover:bg-slate-100" title="Editar">
                                                <EditIcon className="w-5 h-5" />
                                            </ReactRouterDOM.Link>
                                            <button onClick={() => handleDelete(broker.id)} className="p-2 text-slate-500 hover:text-red-600 rounded-md hover:bg-slate-100" title="Remover">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BrokersPage;