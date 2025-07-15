
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProperties } from '../../contexts/PropertyContext';
import { USERS, APPLICATIONS } from '../../constants';
import { PropertyStatus, PropertyPurpose } from '../../types';
import { ChevronLeftIcon, EditIcon, ArchiveIcon, MapPinIcon, DollarSignIcon, BedIcon, BathIcon, MaximizeIcon, CheckCircleIcon, CalendarIcon } from '../../components/Icons';

const PropertyDetailPage: React.FC = () => {
    const { propertyId } = useParams<{ propertyId: string }>();
    const { properties, toggleArchiveProperty } = useProperties();
    const property = properties.find(p => p.id === propertyId);
    const propertyApplications = APPLICATIONS.filter(app => app.propertyId === propertyId);

    if (!property) {
        return (
            <div className="text-center p-8">
                <h1 className="text-2xl text-slate-600">Imóvel não encontrado.</h1>
                <Link to="/admin/properties" className="mt-4 inline-block text-indigo-600 hover:underline">
                    Voltar para a lista de propriedades
                </Link>
            </div>
        );
    }
    
    const priceLabel = property.purpose === PropertyPurpose.RENT ? 'Aluguel' : 'Preço de Venda';
    const priceValue = property.purpose === PropertyPurpose.RENT 
        ? `$${property.rentPrice?.toLocaleString()}/mês` 
        : `$${property.salePrice?.toLocaleString()}`;


    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Link to="/admin/properties" className="flex items-center text-sm text-slate-600 hover:text-indigo-600 font-semibold">
                        <ChevronLeftIcon className="w-5 h-5 mr-1" />
                        Voltar para Propriedades
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900 mt-1">{property.title}</h1>
                    <div className="flex items-center text-slate-500 mt-1">
                        <MapPinIcon className="w-4 h-4 mr-1.5" />
                        <span>{property.address}</span>
                    </div>
                </div>
                <div className="flex space-x-3">
                    <Link to={`/admin/properties/edit/${property.id}`} className="flex items-center bg-white border border-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
                        <EditIcon className="w-5 h-5 mr-2" />
                        Editar
                    </Link>
                    <button onClick={() => toggleArchiveProperty(property.id)} className={`flex items-center text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors ${property.status === PropertyStatus.ARCHIVED ? 'bg-blue-500 hover:bg-blue-600' : 'bg-red-500 hover:bg-red-600'}`}>
                        <ArchiveIcon className="w-5 h-5 mr-2" />
                        {property.status === PropertyStatus.ARCHIVED ? 'Desarquivar' : 'Arquivar'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    {/* Image Gallery */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Galeria de Fotos</h2>
                        <div className="grid grid-cols-3 gap-4">
                            {property.images.slice(0, 3).map((img, index) => (
                                <img key={index} src={img} alt={`${property.title} ${index + 1}`} className="w-full h-40 object-cover rounded-lg" />
                            ))}
                        </div>
                    </div>
                    
                    {/* Details Card */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Detalhes do Imóvel</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <div className="flex items-center space-x-2">
                                <DollarSignIcon className="w-6 h-6 text-indigo-500" />
                                <div>
                                    <p className="text-sm text-slate-500">{priceLabel}</p>
                                    <p className="font-semibold text-slate-700">{priceValue}</p>
                                </div>
                            </div>
                             <div className="flex items-center space-x-2">
                                <BedIcon className="w-6 h-6 text-indigo-500" />
                                <div>
                                    <p className="text-sm text-slate-500">Quartos</p>
                                    <p className="font-semibold text-slate-700">{property.bedrooms}</p>
                                </div>
                            </div>
                             <div className="flex items-center space-x-2">
                                <BathIcon className="w-6 h-6 text-indigo-500" />
                                <div>
                                    <p className="text-sm text-slate-500">Banheiros</p>
                                    <p className="font-semibold text-slate-700">{property.bathrooms}</p>
                                </div>
                            </div>
                             <div className="flex items-center space-x-2">
                                <MaximizeIcon className="w-6 h-6 text-indigo-500" />
                                <div>
                                    <p className="text-sm text-slate-500">Área</p>
                                    <p className="font-semibold text-slate-700">{property.areaM2} m²</p>
                                </div>
                            </div>
                             <div className="flex items-center space-x-2">
                                <CalendarIcon className="w-6 h-6 text-indigo-500" />
                                <div>
                                    <p className="text-sm text-slate-500">Construído em</p>
                                    <p className="font-semibold text-slate-700">{property.yearBuilt}</p>
                                </div>
                            </div>
                             <div className="flex items-center space-x-2">
                                <CheckCircleIcon className="w-6 h-6 text-indigo-500" />
                                <div>
                                    <p className="text-sm text-slate-500">Qualidade</p>
                                    <p className="font-semibold text-slate-700">{property.repairQuality}</p>
                                </div>
                            </div>
                        </div>
                         <hr className="my-6"/>
                         <h3 className="text-lg font-semibold text-slate-800 mb-3">Descrição</h3>
                         <p className="text-slate-600 leading-relaxed">{property.description}</p>
                    </div>

                    {/* Applications History */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Aplicações Recentes</h2>
                        {propertyApplications.length > 0 ? (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50">
                                        <th className="p-3 font-semibold text-slate-600">Candidato</th>
                                        <th className="p-3 font-semibold text-slate-600">Data</th>
                                        <th className="p-3 font-semibold text-slate-600">Status</th>
                                        <th className="p-3 font-semibold text-slate-600"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {propertyApplications.map(app => {
                                        const applicant = USERS.find(u => u.id === app.applicantId);
                                        return (
                                            <tr key={app.id} className="border-b border-slate-200 hover:bg-slate-50">
                                                <td className="p-3">
                                                    <div className="flex items-center space-x-3">
                                                         <img src={applicant?.avatarUrl} alt={applicant?.name} className="w-8 h-8 rounded-full" />
                                                         <span className="font-medium text-slate-800">{applicant?.name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-3 text-slate-600">{new Date(app.applicationDate).toLocaleDateString()}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                        app.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                                                        app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-right">
                                                    <Link to={`/admin/application/${app.id}`} className="text-indigo-600 hover:underline text-sm font-semibold">Ver</Link>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-slate-500">Nenhuma aplicação para este imóvel.</p>
                        )}
                    </div>

                </div>

                <div className="lg:col-span-1 space-y-8 sticky top-8">
                     {/* Status Card */}
                     <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Status</h2>
                        <div className="flex items-center space-x-3">
                             <span className={`w-3 h-3 rounded-full ${
                                property.status === PropertyStatus.AVAILABLE ? 'bg-green-500' :
                                property.status === PropertyStatus.RENTED ? 'bg-yellow-500' :
                                property.status === PropertyStatus.SOLD ? 'bg-blue-500' :
                                'bg-slate-500'
                            }`}></span>
                            <span className="text-lg font-semibold text-slate-700">{property.status}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PropertyDetailPage;
