



import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { APPLICATIONS, USERS } from '../../constants';
import { useProperties } from '../../contexts/PropertyContext';
import { Application, Property, User } from '../../types';
import { SearchIcon } from '../../components/Icons';

interface ApplicationListItemProps {
    application: Application;
    user: User;
    isSelected: boolean;
    onSelect: (app: Application) => void;
}

const ApplicationListItem: React.FC<ApplicationListItemProps> = ({ application, user, isSelected, onSelect }) => {
    return (
        <div
            onClick={() => onSelect(application)}
            className={`p-4 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-primary-blue/10' : 'hover:bg-slate-100'}`}
        >
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                    <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
                    <div>
                        <p className="font-semibold text-slate-800">{user.name}</p>
                        <p className="text-sm text-slate-500">Renda: ${application.totalIncome?.toLocaleString()}</p>
                    </div>
                </div>
                <p className="text-xs text-slate-400">{new Date(application.applicationDate).toLocaleDateString()}</p>
            </div>
        </div>
    )
}


interface ApplicationDetailViewProps {
    application: Application | null;
    user: User | null;
    property: Property | null;
}

const ApplicationDetailView: React.FC<ApplicationDetailViewProps> = ({ application, user, property }) => {
    const navigate = useNavigate();

    if (!application || !user || !property) {
        return (
            <div className="flex-1 flex items-center justify-center bg-white rounded-lg shadow-sm">
                <p className="text-slate-500">Selecione uma aplicação para ver os detalhes</p>
            </div>
        )
    }

    const handleViewFullApplication = () => {
        navigate(`/admin/application/${application.id}`);
    }

    return (
        <div className="flex-1 bg-white p-8 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold text-slate-800">Visão detalhada do inquilino</h2>
            <div className="mt-6 text-center">
                <img src={user.avatarUrl} alt={user.name} className="w-24 h-24 rounded-full mx-auto" />
                <h3 className="mt-4 text-lg font-semibold text-slate-800">{user.name}</h3>
                <span className={`mt-1 inline-block px-3 py-1 text-sm font-medium rounded-full ${application.status === 'Accepted' ? 'bg-green-100 text-green-800' : application.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {application.status}
                </span>
            </div>
            <div className="mt-8 space-y-4">
                <div className="flex justify-between">
                    <span className="text-slate-500">Data de Aplicação</span>
                    <span className="font-semibold text-slate-800">{new Date(application.applicationDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-500">Nº de Ocupantes</span>
                    <span className="font-semibold text-slate-800">{application.occupants}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-slate-500">Renda Total</span>
                    <span className="font-semibold text-slate-800">${application.totalIncome?.toLocaleString()}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-slate-500">Renda p/ Aluguel</span>
                    <span className="font-semibold text-slate-800">{application.incomeToRentRatio}x</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-slate-500">Imóvel Aplicado</span>
                    <span className="font-semibold text-slate-800">{property.title}</span>
                </div>
            </div>
            <button
                onClick={handleViewFullApplication}
                className="w-full mt-8 bg-primary-green text-white font-semibold py-3 rounded-lg hover:opacity-95 transition-colors"
            >
                Ver Aplicação Completa
            </button>
        </div>
    )
}

const ApplicationsPage: React.FC = () => {
    const [selectedAppId, setSelectedAppId] = useState<string | null>(APPLICATIONS[0]?.id || null);
    const { properties } = useProperties();

    const handleSelectApp = (app: Application) => {
        setSelectedAppId(app.id);
    }
    
    const selectedApplication = APPLICATIONS.find(app => app.id === selectedAppId);
    const applicantUser = USERS.find(user => user.id === selectedApplication?.applicantId);
    const appliedProperty = properties.find(prop => prop.id === selectedApplication?.propertyId);

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900">Aplicações de Locação</h1>
            <div className="mt-6 flex space-x-6">
                <div className="w-1/3 bg-white p-4 rounded-lg shadow-sm flex flex-col">
                    <div className="relative mb-4">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <SearchIcon className="w-5 h-5 text-slate-400" />
                        </span>
                        <input type="text" placeholder="Buscar inquilino por nome..." className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-primary-blue focus:border-primary-blue" />
                    </div>
                     <div className="mb-4">
                        <select className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-primary-blue focus:border-primary-blue">
                            <option>Todos os Inquilinos</option>
                            <option>Pendentes</option>
                            <option>Aceitos</option>
                            <option>Rejeitados</option>
                        </select>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                        {APPLICATIONS.map(app => {
                            const user = USERS.find(u => u.id === app.applicantId);
                            if (!user) return null;
                            return <ApplicationListItem key={app.id} application={app} user={user} isSelected={selectedAppId === app.id} onSelect={handleSelectApp}/>
                        })}
                    </div>
                </div>
                <ApplicationDetailView 
                    application={selectedApplication || null} 
                    user={applicantUser || null} 
                    property={appliedProperty || null}
                />
            </div>
        </div>
    );
};

export default ApplicationsPage;