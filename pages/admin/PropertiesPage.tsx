

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProperties } from '../../contexts/PropertyContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCategories } from '../../contexts/CategoryContext';
import { useStorageConfig } from '../../contexts/StorageConfigContext';
import { Property, PropertyStatus, PropertyPurpose, PropertyType } from '../../types';
import { SearchIcon, PlusIcon, EyeIcon, EditIcon, ArchiveIcon, TrashIcon, GripVerticalIcon } from '../../components/Icons';
import { getOptimizedImageUrl } from '../../lib/localize';

const BulkActionBar: React.FC<{
    selectedCount: number;
    onClear: () => void;
    onAction: (action: 'archive' | 'unarchive' | 'delete' | 'changeStatus' | 'changeCategory' | 'changeType', value?: any) => void;
}> = ({ selectedCount, onClear, onAction }) => {
    const { t, propertyTypes } = useLanguage();
    const { categories } = useCategories();
    
    return (
        <div className="bg-primary-blue/10 p-3 rounded-lg mb-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
                <span className="font-semibold text-primary-blue">{selectedCount} imóveis selecionados</span>
                <button onClick={onClear} className="ml-4 text-sm text-primary-blue font-semibold hover:underline">Limpar seleção</button>
            </div>
            <div className="flex items-center space-x-2 flex-wrap gap-2">
                 <select
                    onChange={(e) => onAction('changeStatus', e.target.value)}
                    className="text-sm border border-slate-300 rounded-lg px-2 py-1 focus:ring-primary-blue focus:border-primary-blue"
                >
                    <option value="">Mudar Status</option>
                    <option value="AVAILABLE">Disponível</option>
                    <option value="RENTED">Alugado</option>
                    <option value="SOLD">Vendido</option>
                </select>
                <select
                    onChange={(e) => onAction('changeCategory', e.target.value)}
                    className="text-sm border border-slate-300 rounded-lg px-2 py-1 focus:ring-primary-blue focus:border-primary-blue"
                >
                    <option value="">Mudar Categoria</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{t(`category:${cat.id}`)}</option>)}
                </select>
                <select
                    onChange={(e) => onAction('changeType', e.target.value)}
                    className="text-sm border border-slate-300 rounded-lg px-2 py-1 focus:ring-primary-blue focus:border-primary-blue"
                >
                    <option value="">Mudar Tipo</option>
                    {propertyTypes.map(type => <option key={type.name} value={type.name}>{t(`propertyType:${type.name}`)}</option>)}
                </select>

                <button onClick={() => onAction('archive')} className="text-sm p-2 text-slate-600 hover:text-yellow-600 rounded-md hover:bg-slate-200" title="Arquivar"><ArchiveIcon className="w-5 h-5"/></button>
                <button onClick={() => onAction('delete')} className="text-sm p-2 text-slate-600 hover:text-red-600 rounded-md hover:bg-slate-200" title="Apagar"><TrashIcon className="w-5 h-5"/></button>
            </div>
        </div>
    );
};


const PropertiesPage: React.FC = () => {
  const { properties, toggleArchiveProperty, deleteProperty, updatePropertyOrder, bulkUpdateProperties, bulkDeleteProperties } = useProperties();
  const { t, propertyTypes } = useLanguage();
  const { categories } = useCategories();
  const { activeConfig } = useStorageConfig();
  const [searchTerm, setSearchTerm] = useState('');
  const [localProperties, setLocalProperties] = useState<Property[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [draggedItem, setDraggedItem] = useState<Property | null>(null);

  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [purposeFilter, setPurposeFilter] = useState('all');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    setLocalProperties(properties);
  }, [properties]);

  useEffect(() => {
    setSelectedProperties([]);
  }, [searchTerm, purposeFilter, propertyTypeFilter, statusFilter]);
  
  const filteredProperties = localProperties.filter(prop => {
      const searchTermMatch = prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (prop.code && prop.code.toLowerCase().includes(searchTerm.toLowerCase()));
      const purposeMatch = purposeFilter === 'all' || prop.purpose === purposeFilter;
      const typeMatch = propertyTypeFilter === 'all' || prop.propertyType === propertyTypeFilter;
      const statusMatch = statusFilter === 'all' || prop.status === statusFilter;
      return searchTermMatch && purposeMatch && typeMatch && statusMatch;
  });
  
  const allVisibleSelected = filteredProperties.length > 0 && selectedProperties.length === filteredProperties.length;

  const handleToggleSelect = (id: string) => {
    setSelectedProperties(prev => 
        prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
          setSelectedProperties(filteredProperties.map(p => p.id));
      } else {
          setSelectedProperties([]);
      }
  };

  const handleBulkAction = async (action: 'archive' | 'unarchive' | 'delete' | 'changeStatus' | 'changeCategory' | 'changeType', value?: any) => {
      if (selectedProperties.length === 0) return;

      switch (action) {
          case 'delete':
              if (window.confirm(`Tem certeza que deseja EXCLUIR PERMANENTEMENTE ${selectedProperties.length} imóveis? Esta ação não pode ser desfeita.`)) {
                  await bulkDeleteProperties(selectedProperties);
                  setSelectedProperties([]);
              }
              break;
          case 'archive':
              await bulkUpdateProperties(selectedProperties, { status: 'ARCHIVED' });
              setSelectedProperties([]);
              break;
          case 'unarchive': // Not a direct action, but good to have
              await bulkUpdateProperties(selectedProperties, { status: 'AVAILABLE' });
              setSelectedProperties([]);
              break;
          case 'changeStatus':
              if (value) {
                  await bulkUpdateProperties(selectedProperties, { status: value as PropertyStatus });
                  setSelectedProperties([]);
              }
              break;
          case 'changeCategory':
              if (value) {
                  await bulkUpdateProperties(selectedProperties, { categoryId: value });
                  setSelectedProperties([]);
              }
              break;
          case 'changeType':
              if (value) {
                  await bulkUpdateProperties(selectedProperties, { propertyType: value as PropertyType });
                  setSelectedProperties([]);
              }
              break;
      }
  }
  
  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, property: Property) => {
    setDraggedItem(property);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.style.opacity = '0.5';
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault(); 
    e.currentTarget.style.background = '#f0f9ff';
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.currentTarget.style.background = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLTableRowElement>, targetProperty: Property) => {
    e.preventDefault();
    e.currentTarget.style.background = '';
    
    if (!draggedItem || draggedItem.id === targetProperty.id) return;

    const currentIndex = localProperties.findIndex(p => p.id === draggedItem.id);
    const targetIndex = localProperties.findIndex(p => p.id === targetProperty.id);

    const newList = [...localProperties];
    const [removed] = newList.splice(currentIndex, 1);
    newList.splice(targetIndex, 0, removed);

    setLocalProperties(newList);
    setIsDirty(true);
    setDraggedItem(null);
  };
  
  const handleDragEnd = (e: React.DragEvent<HTMLTableRowElement>) => {
      e.currentTarget.style.opacity = '1';
      setDraggedItem(null);
  }
  
  const handleSaveChanges = async () => {
      const updates = localProperties.map((p, index) => ({
          id: p.id,
          display_order: index,
      }));
      await updatePropertyOrder(updates);
      setIsDirty(false);
  };

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
        <div className="flex items-center space-x-3">
          {isDirty && (
            <button onClick={handleSaveChanges} className="bg-primary-blue text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:opacity-95 transition-all duration-200">
              Salvar Ordem
            </button>
          )}
          <Link to="/admin/properties/new" className="flex items-center bg-primary-green text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:opacity-95 transition-all duration-200">
            <PlusIcon className="w-5 h-5 mr-2" />
            Adicionar Propriedade
          </Link>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <div className="relative w-full md:w-auto md:flex-grow">
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
          <div className="w-full md:w-auto flex space-x-2">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-primary-blue focus:border-primary-blue">
                <option value="all">Status: Todos</option>
                <option value="AVAILABLE">Disponível</option>
                <option value="RENTED">Alugado</option>
                <option value="SOLD">Vendido</option>
                <option value="ARCHIVED">Arquivado</option>
            </select>
            <select value={purposeFilter} onChange={e => setPurposeFilter(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-primary-blue focus:border-primary-blue">
                <option value="all">Finalidade: Todas</option>
                <option value="RENT">Aluguel</option>
                <option value="SALE">Venda</option>
                <option value="SEASONAL">Temporada</option>
            </select>
            <select value={propertyTypeFilter} onChange={e => setPropertyTypeFilter(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-primary-blue focus:border-primary-blue">
                <option value="all">Tipo: Todos</option>
                {propertyTypes.map(type => <option key={type.name} value={type.name}>{t(`propertyType:${type.name}`)}</option>)}
            </select>
          </div>
        </div>

        {selectedProperties.length > 0 && <BulkActionBar selectedCount={selectedProperties.length} onClear={() => setSelectedProperties([])} onAction={handleBulkAction} />}

        {/* Mobile View */}
        <div className="md:hidden space-y-4">
            {filteredProperties.map(prop => (
                <div key={prop.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 space-y-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                            <input type="checkbox" checked={selectedProperties.includes(prop.id)} onChange={() => handleToggleSelect(prop.id)} className="mt-1 h-5 w-5 rounded text-primary-blue focus:ring-primary-blue border-slate-300"/>
                            <img src={getOptimizedImageUrl(prop.images[0], { width: 64, height: 48 }, activeConfig)} alt={prop.title} className="w-16 h-12 rounded-md object-cover flex-shrink-0" />
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
                <th className="p-4 w-12"><input type="checkbox" checked={allVisibleSelected} onChange={handleSelectAll} className="h-5 w-5 rounded text-primary-blue focus:ring-primary-blue border-slate-300"/></th>
                <th className="p-4 font-semibold text-slate-600 w-12"></th>
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
                <tr 
                  key={prop.id}
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, prop)}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, prop)}
                  onDragEnd={handleDragEnd}
                  className={`border-b border-slate-200 transition-colors ${selectedProperties.includes(prop.id) ? 'bg-primary-blue/5' : 'hover:bg-slate-50'}`}
                >
                  <td className="p-4"><input type="checkbox" checked={selectedProperties.includes(prop.id)} onChange={() => handleToggleSelect(prop.id)} className="h-5 w-5 rounded text-primary-blue focus:ring-primary-blue border-slate-300"/></td>
                  <td className="p-4 text-center text-slate-400">
                    <GripVerticalIcon className="cursor-move mx-auto" />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <img src={getOptimizedImageUrl(prop.images[0], { width: 64, height: 48 }, activeConfig)} alt={prop.title} className="w-16 h-12 rounded-md object-cover" />
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
