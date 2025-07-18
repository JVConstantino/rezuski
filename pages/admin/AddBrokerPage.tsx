
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBrokers } from '../../contexts/BrokerContext';
import BrokerForm from '../../components/admin/BrokerForm';
import { Broker } from '../../types';
import { ChevronLeftIcon } from '../../components/Icons';

const AddBrokerPage: React.FC = () => {
    const { addBroker } = useBrokers();
    const navigate = useNavigate();

    const handleSubmit = async (data: Omit<Broker, 'id'>) => {
        const newBroker = await addBroker(data);
        if (newBroker) {
            navigate('/admin/brokers');
        } else {
            alert('Falha ao adicionar o corretor. Por favor, tente novamente.');
        }
    };

    return (
        <div>
            <Link to="/admin/brokers" className="flex items-center text-sm text-slate-600 hover:text-indigo-600 font-semibold mb-2">
                <ChevronLeftIcon className="w-5 h-5 mr-1" />
                Voltar para Corretores
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Adicionar Novo Corretor</h1>
            <BrokerForm onSubmit={handleSubmit} isEditing={false} />
        </div>
    );
};

export default AddBrokerPage;
