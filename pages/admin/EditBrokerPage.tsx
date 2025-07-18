


import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBrokers } from '../../contexts/BrokerContext';
import BrokerForm from '../../components/admin/BrokerForm';
import { Broker } from '../../types';
import { ChevronLeftIcon } from '../../components/Icons';

const EditBrokerPage: React.FC = () => {
    const { brokerId } = useParams<{ brokerId: string }>();
    const { brokers, updateBroker } = useBrokers();
    const navigate = useNavigate();

    const brokerToEdit = brokers.find(b => b.id === brokerId);

    const handleSubmit = async (data: Omit<Broker, 'id'>) => {
        if (brokerToEdit) {
            const updatedBroker = { ...brokerToEdit, ...data };
            await updateBroker(updatedBroker);
            navigate('/admin/brokers');
        }
    };

    if (!brokerToEdit) {
        return <div className="text-center p-8">Corretor não encontrado.</div>;
    }

    return (
        <div>
            <Link to="/admin/brokers" className="flex items-center text-sm text-slate-600 hover:text-indigo-600 font-semibold mb-2">
                <ChevronLeftIcon className="w-5 h-5 mr-1" />
                Voltar para Corretores
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Editar Corretor</h1>
            <BrokerForm initialData={brokerToEdit} onSubmit={handleSubmit} isEditing={true} />
        </div>
    );
};

export default EditBrokerPage;