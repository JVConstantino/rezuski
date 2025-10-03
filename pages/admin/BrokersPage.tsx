
import React from 'react'
import { Link } from 'react-router-dom'
import { useBrokers } from '../../contexts/BrokerContext'
import { PlusIcon, EditIcon, TrashIcon, MailIcon, PhoneIcon } from '../../components/Icons'
import ImageWithFallback from '../../components/ImageWithFallback'
import { useStorageConfig } from '../../contexts/StorageConfigContext'
import { getOptimizedImageUrl } from '../../lib/localize'

const BrokersPage: React.FC = () => {
    const { brokers, deleteBroker } = useBrokers()
    const placeholderAvatar = 'https://via.placeholder.com/150'
    const { activeConfig } = useStorageConfig()

    const handleDelete = (id: string, name: string) => {
        if (window.confirm(`Tem certeza que deseja remover o corretor "${name}"?`)) {
            deleteBroker(id);
        }
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-slate-900">Gerenciar Corretores</h1>
                <Link to="/admin/brokers/new" className="flex items-center bg-primary-green text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:opacity-95 transition-all duration-200">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Adicionar Corretor
                </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
                 {/* Mobile View */}
                <div className="md:hidden space-y-4">
                    {brokers.map(broker => (
                        <div key={broker.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <ImageWithFallback 
                                        src={getOptimizedImageUrl(broker.avatarUrl ? broker.avatarUrl : placeholderAvatar, { width: 64, height: 64 }, activeConfig)} 
                                        alt={broker.name} 
                                        className="w-16 h-16 rounded-full object-cover" 
                                    />
                                    <div>
                                        <p className="font-semibold text-slate-800 text-lg">{broker.name}</p>
                                        <p className="text-sm text-primary-blue font-medium">{broker.title}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-1">
                                    <Link to={`/admin/brokers/edit/${broker.id}`} className="p-2 text-slate-500 hover:text-primary-blue rounded-md hover:bg-slate-100" title="Editar">
                                        <EditIcon className="w-5 h-5" />
                                    </Link>
                                    <button onClick={() => handleDelete(broker.id, broker.name)} className="p-2 text-slate-500 hover:text-red-600 rounded-md hover:bg-slate-100" title="Remover">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-600 space-y-2">
                                <div className="flex items-center space-x-2">
                                    <MailIcon className="w-4 h-4 text-slate-400"/>
                                    <a href={`mailto:${broker.email}`} className="hover:underline">{broker.email}</a>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <PhoneIcon className="w-4 h-4 text-slate-400"/>
                                    <a href={`tel:${broker.phone}`} className="hover:underline">{broker.phone}</a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
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
                                            <ImageWithFallback 
                                                src={getOptimizedImageUrl(broker.avatarUrl ? broker.avatarUrl : placeholderAvatar, { width: 48, height: 48 }, activeConfig)} 
                                                alt={broker.name} 
                                                className="w-12 h-12 rounded-full object-cover" 
                                            />
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
                                            <Link to={`/admin/brokers/edit/${broker.id}`} className="p-2 text-slate-500 hover:text-primary-blue rounded-md hover:bg-slate-100" title="Editar">
                                                <EditIcon className="w-5 h-5" />
                                            </Link>
                                            <button onClick={() => handleDelete(broker.id, broker.name)} className="p-2 text-slate-500 hover:text-red-600 rounded-md hover:bg-slate-100" title="Remover">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {brokers.length === 0 && (
                    <div className="text-center py-10 text-slate-500">
                        <p>Nenhum corretor encontrado.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrokersPage;
