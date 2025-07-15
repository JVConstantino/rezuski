

import React from 'react';
import { TENANTS, USERS } from '../../constants';
import { useProperties } from '../../contexts/PropertyContext';
import { SearchIcon, MessageSquareIcon } from '../../components/Icons';

const TenantsPage: React.FC = () => {
  const { properties } = useProperties();
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Gerenciar Inquilinos</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-1/3">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <SearchIcon className="w-5 h-5 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Buscar por nome do inquilino..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="p-4 font-semibold text-slate-600">Inquilino</th>
                <th className="p-4 font-semibold text-slate-600">Propriedade</th>
                <th className="p-4 font-semibold text-slate-600">Fim do Contrato</th>
                <th className="p-4 font-semibold text-slate-600">Aluguel</th>
                <th className="p-4 font-semibold text-slate-600 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {TENANTS.map(tenant => {
                const user = USERS.find(u => u.id === tenant.userId);
                const property = properties.find(p => p.id === tenant.propertyId);
                if (!user || !property) return null;
                
                return (
                  <tr key={tenant.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
                        <div>
                          <p className="font-semibold text-slate-800">{user.name}</p>
                          <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-slate-800">{property.title}</p>
                      <p className="text-sm text-slate-500">{property.address}</p>
                    </td>
                    <td className="p-4 text-slate-600">{new Date(tenant.leaseEndDate).toLocaleDateString('pt-BR')}</td>
                    <td className="p-4 font-medium text-slate-800">R$ {tenant.rentAmount.toLocaleString('pt-BR')}</td>
                    <td className="p-4 text-center">
                      <button className="p-2 text-slate-500 hover:text-primary-blue rounded-md hover:bg-slate-100" title="Enviar Mensagem">
                        <MessageSquareIcon className="w-5 h-5"/>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TenantsPage;
