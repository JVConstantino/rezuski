
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProperties } from '../../contexts/PropertyContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { PropertyStatus } from '../../types';
import { SearchIcon, PlusIcon, EyeIcon, EditIcon, ArchiveIcon, TrashIcon } from '../../components/Icons';

const PropertiesPage: React.FC = () => {
  const { properties, toggleArchiveProperty, deleteProperty } = useProperties();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProperties = properties.filter(prop => 
    prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (prop.code && prop.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Tem certeza que deseja EXCLUIR PERMANENTEMENTE o imóvel "${title}"? Esta ação não pode ser desfeita.`)) {
        await deleteProperty(id);
    }
  }

  const propertyStatusColor: Record<string, string> = {
      ['AVAILABLE']: 'bg-green-100 text-green-800',
      ['RENTED']: 'bg-yellow-100 text-yellow-800',
      ['SOLD']: 'bg-blue-100 text-blue-800',
      ['ARCHIVED']: 'bg-slate-100 text-slate-800',
  };

  const getPriceDisplay = (prop: typeof properties[0]) => {
    if (prop.purpose === 'SALE') {
        return `R$ ${prop.salePrice?.toLocaleString('pt-BR')}`;
    }
    const suffix = prop.purpose === 'RENT' ? t('price.per_month') : t('price.per_day');
    return `R$ ${prop.rentPrice?.toLocaleString('pt-BR')}${suffix}`;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-slate-900">Gerenciar Propriedades</h1>
        <Link to="/admin/properties/new" className="flex items-center bg-primary-green text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:opacity-95 transition-all duration-200">
          <PlusIcon className="w-5 h-5 mr-2" />
          Adicionar Propriedade
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-full md:w-1/3">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <SearchIcon className="w-5 h-5 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Buscar por nome ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-primary-blue focus:border-primary-blue"
            />
          </div>
          <div className="hidden md:flex space-x-4">
            <select className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-primary-blue focus:border-primary-blue">
              <option>Status: Todos</option>
              <option>Disponível</option>
              <option>Alugado</option>
              <option>Vendido</option>
              <option>Arquivado</option>
            </select>
          </div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-4">
            {filteredProperties.map(prop => (
                <div key={prop.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 space-y-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                            <img src={prop.images[0]} alt={prop.title} className="w-16 h-12 rounded-md object-cover flex-shrink-0" />
                            <div className="flex-grow">
                                <p className="font-semibold text-slate-800 line-clamp-2">{prop.title}</p>
                                <p className="text-sm text-slate-500 font-mono">{prop.code || '-'}</p>
                            </div>
                        </div>
                         <span className={`flex-shrink-0 ml-2 px-2 py-1 text-xs font-medium rounded-full ${propertyStatusColor[prop.status] || 'bg-slate-100 text-slate-800'}`}>
                            {t(`property.status.${prop.status}`)}
                        </span>
                    </div>
                     <div>
                        <p className="font-medium text-slate-800">{getPriceDisplay(prop)}</p>
                        <p className="text-sm text-slate-500 capitalize">{t(`property.purpose.${prop.purpose}`)} - {t(`propertyType:${prop.propertyType}`)}</p>
                    </div>
                    <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                        <Link to={`/admin/properties/${prop.id}`} className="p-2 text-slate-500 hover:text-primary-blue rounded-md hover:bg-slate-100" title="Visualizar"><EyeIcon className="w-5 h-5"/></Link>
                        <Link to={`/admin/properties/edit/${prop.id}`} className="p-2 text-slate-500 hover:text-primary-blue rounded-md hover:bg-slate-100" title="Editar"><EditIcon className="w-5 h-5"/></Link>
                        <button onClick={() => toggleArchiveProperty(prop.id)} className="p-2 text-slate-500 hover:text-yellow-600 rounded-md hover:bg-slate-100" title={prop.status === 'ARCHIVED' ? 'Desarquivar' : 'Arquivar'}><ArchiveIcon className="w-5 h-5"/></button>
                        <button onClick={() => handleDelete(prop.id, prop.title)} className="p-2 text-slate-500 hover:text-red-600 rounded-md hover:bg-slate-100" title="Excluir"><TrashIcon className="w-5 h-5"/></button>
                    </div>
                </div>
            ))}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="p-4 font-semibold text-slate-600">Propriedade</th>
                <th className="p-4 font-semibold text-slate-600">Código</th>
                <th className="p-4 font-semibold text-slate-600">Status</th>
                <th className="p-4 font-semibold text-slate-600">Finalidade</th>
                <th className="p-4 font-semibold text-slate-600">Preço</th>
                <th className="p-4 font-semibold text-slate-600">Tipo</th>
                <th className="p-4 font-semibold text-slate-600 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map(prop => (
                <tr key={prop.id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <img src={prop.images[0]} alt={prop.title} className="w-16 h-12 rounded-md object-cover" />
                      <div>
                        <p className="font-semibold text-slate-800">{prop.title}</p>
                        <p className="text-sm text-slate-500">{prop.address}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-sm text-slate-600">{prop.code || '-'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${propertyStatusColor[prop.status] || 'bg-slate-100 text-slate-800'}`}>
                      {t(`property.status.${prop.status}`)}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 capitalize">
                    {t(`property.purpose.${prop.purpose}`)}
                  </td>
                  <td className="p-4 font-medium text-slate-800">
                    {getPriceDisplay(prop)}
                  </td>
                  <td className="p-4 text-slate-600">{t(`propertyType:${prop.propertyType}`)}</td>
                  <td className="p-4">
                    <div className="flex justify-center space-x-2">
                      <Link to={`/admin/properties/${prop.id}`} className="p-2 text-slate-500 hover:text-primary-blue rounded-md hover:bg-slate-100" title="Visualizar">
                        <EyeIcon className="w-5 h-5"/>
                      </Link>
                      <Link to={`/admin/properties/edit/${prop.id}`} className="p-2 text-slate-500 hover:text-primary-blue rounded-md hover:bg-slate-100" title="Editar">
                        <EditIcon className="w-5 h-5"/>
                      </Link>
                      <button onClick={() => toggleArchiveProperty(prop.id)} className="p-2 text-slate-500 hover:text-yellow-600 rounded-md hover:bg-slate-100" title={prop.status === 'ARCHIVED' ? 'Desarquivar' : 'Arquivar'}>
                        <ArchiveIcon className="w-5 h-5"/>
                      </button>
                      <button onClick={() => handleDelete(prop.id, prop.title)} className="p-2 text-slate-500 hover:text-red-600 rounded-md hover:bg-slate-100" title="Excluir">
                        <TrashIcon className="w-5 h-5"/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredProperties.length === 0 && (
            <div className="text-center py-10 text-slate-500">
                <p>Nenhuma propriedade encontrada.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesPage;