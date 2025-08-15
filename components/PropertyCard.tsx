import React from 'react';
import { Link } from 'react-router-dom';
import { Property } from '../types';
import { BedIcon, BathIcon, MaximizeIcon, MapPinIcon, HashIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { localizeProperty, getOptimizedImageUrl } from '../lib/localize';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property: originalProperty }) => {
    const { locale, t } = useLanguage();
    const property = localizeProperty(originalProperty, locale);

    const getPriceDisplay = (p: Property) => {
        let price: number | undefined;
        let suffix = '';

        switch(p.purpose) {
            case 'SALE':
                price = p.salePrice;
                break;
            case 'RENT':
                price = p.rentPrice;
                suffix = t('price.per_month');
                break;
            case 'SEASONAL':
                price = p.rentPrice;
                suffix = t('price.per_day');
                break;
            default:
                return { text: t('price.on_request'), suffix: '' };
        }

        const formattedPrice = price ? `R$ ${price.toLocaleString('pt-BR')}` : t('price.on_request');
        return { text: formattedPrice, suffix };
    };

  const { text: displayPrice, suffix: priceSuffix } = getPriceDisplay(property);
  const locationDisplay = [property.neighborhood, property.city].filter(Boolean).join(', ');
  const optimizedImageUrl = getOptimizedImageUrl(property.images[0], { width: 500, height: 281 });

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-full transition-shadow hover:shadow-lg">
      <div className="relative">
        <img src={optimizedImageUrl} alt={property.title} className="w-full aspect-video object-cover" />
        {property.isPopular && (
          <div className="absolute top-3 left-3 bg-primary-blue text-white text-xs font-bold px-2 py-1 rounded">
            POPULAR
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-2">
            <p className="text-xl font-bold text-primary-blue">
                {displayPrice}
                {priceSuffix && <span className="text-sm font-normal text-slate-500">{priceSuffix}</span>}
            </p>
        </div>
        <h3 className="text-lg font-semibold text-slate-800 truncate">{property.title}</h3>
        <p className="text-slate-500 text-sm truncate flex items-center mt-1">
            <MapPinIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />
            {locationDisplay || property.address}
        </p>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold bg-slate-100 px-2 py-1 rounded">{t(`propertyType:${property.propertyType}`)}</span>
            {property.code && (
                <span className="font-mono bg-slate-100 px-2 py-1 rounded flex items-center">
                    <HashIcon className="w-3 h-3 mr-1"/>{property.code}
                </span>
            )}
        </div>
        <hr className="my-4 border-t border-slate-200" />
        <div className="flex justify-between text-sm text-slate-600">
          <div className="flex items-center">
            <BedIcon className="w-4 h-4 mr-2 text-primary-blue" />
            <span>{property.bedrooms} {t('details.bedrooms')}</span>
          </div>
          <div className="flex items-center">
            <BathIcon className="w-4 h-4 mr-2 text-primary-blue" />
            <span>{property.bathrooms} {t('details.bathrooms')}</span>
          </div>
          <div className="flex items-center">
            <MaximizeIcon className="w-4 h-4 mr-2 text-primary-blue" />
            <span>{property.areaM2} m²</span>
          </div>
        </div>
        <div className="mt-auto pt-5">
            <Link to={`/property/${property.id}`} className="w-full block text-center bg-primary-green text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green transition-all duration-200">
                {t('property.view_property')}
            </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
