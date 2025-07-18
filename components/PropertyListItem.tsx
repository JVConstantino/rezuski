



import React from 'react';
import { Link } from 'react-router-dom';
import { Property, PropertyPurpose } from '../types';
import { BedIcon, BathIcon, MaximizeIcon, MapPinIcon } from './Icons';

interface PropertyListItemProps {
  property: Property;
}

const PropertyListItem: React.FC<PropertyListItemProps> = ({ property }) => {
  const getPriceDisplay = (p: Property) => {
    let price: number | undefined;
    let suffix: React.ReactNode = null;

    switch(p.purpose) {
        case PropertyPurpose.SALE:
            price = p.salePrice;
            break;
        case PropertyPurpose.RENT:
            price = p.rentPrice;
            suffix = <span className="text-sm font-normal text-slate-500">/mês</span>;
            break;
        case PropertyPurpose.SEASONAL:
            price = p.rentPrice;
            suffix = <span className="text-sm font-normal text-slate-500">/diária</span>;
            break;
    }

    const formattedPrice = price ? `R$ ${price.toLocaleString('pt-BR')}` : 'Sob consulta';
    return { text: formattedPrice, suffix };
  };

  const { text: displayPrice, suffix: priceSuffix } = getPriceDisplay(property);
  const locationDisplay = [property.neighborhood, property.city].filter(Boolean).join(', ');

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col md:flex-row transition-shadow hover:shadow-md">
      <div className="md:w-1/3 lg:w-1/4 flex-shrink-0">
        <Link to={`/property/${property.id}`}>
         <img src={property.images[0]} alt={property.title} className="w-full h-48 md:h-full object-cover" />
        </Link>
      </div>
      <div className="p-5 flex flex-col flex-grow md:w-2/3 lg:w-3/4">
        <div className="flex justify-between items-start">
            <div>
                 <h3 className="text-xl font-bold text-slate-800 hover:text-primary-blue transition-colors">
                    <Link to={`/property/${property.id}`}>{property.title}</Link>
                 </h3>
                 <p className="text-slate-500 text-sm flex items-center mt-1">
                    <MapPinIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />
                    {locationDisplay || property.address}
                </p>
            </div>
            <p className="text-2xl font-bold text-primary-blue flex-shrink-0 ml-4">
                {displayPrice}
                {priceSuffix}
            </p>
        </div>
        
        <p className="mt-3 text-slate-600 text-sm leading-relaxed line-clamp-2">
            {property.description}
        </p>

        <div className="mt-auto pt-4">
            <hr className="mb-4 border-t border-slate-200" />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                 <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
                  <div className="flex items-center">
                    <BedIcon className="w-4 h-4 mr-2 text-primary-blue" />
                    <span>{property.bedrooms} Quartos</span>
                  </div>
                  <div className="flex items-center">
                    <BathIcon className="w-4 h-4 mr-2 text-primary-blue" />
                    <span>{property.bathrooms} Banheiros</span>
                  </div>
                  <div className="flex items-center">
                    <MaximizeIcon className="w-4 h-4 mr-2 text-primary-blue" />
                    <span>{property.areaM2} m²</span>
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 flex-shrink-0">
                    <Link to={`/property/${property.id}`} className="inline-block bg-primary-green text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green transition-all duration-200">
                        Ver Imóvel
                    </Link>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyListItem;