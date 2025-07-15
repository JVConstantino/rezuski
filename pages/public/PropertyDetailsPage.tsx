
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PropertyCard from '../../components/PropertyCard';
import { useProperties } from '../../contexts/PropertyContext';
import { Share2Icon, HeartIcon, MapIcon, BedIcon, BathIcon, MaximizeIcon, CheckCircleIcon, CalendarIcon, ChevronLeftIcon, ChevronRightIcon, XIcon, DollarSignIcon } from '../../components/Icons';
import { Property, PriceHistory, PropertyPurpose } from '../../types';
import BottomNavBar from '../../components/BottomNavBar';

const Lightbox: React.FC<{
    images: string[];
    currentIndex: number;
    onClose: () => void;
    onPrev: () => void;
    onNext: () => void;
}> = ({ images, currentIndex, onClose, onPrev, onNext }) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') onPrev();
            if (e.key === 'ArrowRight') onNext();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, onPrev, onNext]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center" onClick={onClose} aria-modal="true" role="dialog">
            <button
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="absolute top-6 right-6 text-white hover:text-slate-300 transition-colors"
                aria-label="Close lightbox"
            >
                <XIcon className="w-8 h-8" />
            </button>

            <button
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                className="absolute left-6 p-2 bg-white/20 rounded-full hover:bg-white/40 transition-colors"
                aria-label="Previous image"
            >
                <ChevronLeftIcon className="w-8 h-8 text-white" />
            </button>
            
            <img 
                src={images[currentIndex]} 
                alt={`Property view ${currentIndex + 1}`} 
                className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
                onClick={e => e.stopPropagation()}
            />
            
            <button
                onClick={(e) => { e.stopPropagation(); onNext(); }}
                className="absolute right-6 p-2 bg-white/20 rounded-full hover:bg-white/40 transition-colors"
                aria-label="Next image"
            >
                <ChevronRightIcon className="w-8 h-8 text-white" />
            </button>
        </div>
    );
};

const ImageCarousel: React.FC<{ images: string[]; title: string; onImageClick: (index: number) => void }> = ({ images, title, onImageClick }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) {
        return <div className="aspect-[16/9] w-full bg-slate-200 rounded-lg flex items-center justify-center text-slate-500">No images available</div>;
    }
    
    const goToNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const goToPrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    };

    const selectImage = (index: number) => {
        setCurrentIndex(index);
    }

    return (
        <div className="w-full">
            {/* Main Image */}
            <div className="relative w-full aspect-[16/9] bg-black rounded-lg overflow-hidden shadow-lg cursor-pointer group" onClick={() => onImageClick(currentIndex)}>
                <img src={images[currentIndex]} alt={`${title} - Imagem ${currentIndex + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />

                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <p className="text-white text-lg font-bold">Clique para ampliar</p>
                </div>

                {images.length > 1 && (
                    <>
                        <button onClick={goToPrev} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 text-white rounded-full hover:bg-white/40 transition-colors z-10" aria-label="Imagem anterior">
                            <ChevronLeftIcon className="w-8 h-8" />
                        </button>
                        <button onClick={goToNext} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 text-white rounded-full hover:bg-white/40 transition-colors z-10" aria-label="Próxima imagem">
                            <ChevronRightIcon className="w-8 h-8" />
                        </button>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="mt-4">
                    <div className="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4">
                        {images.map((img, index) => (
                            <button 
                                key={index} 
                                onClick={() => selectImage(index)} 
                                className={`flex-shrink-0 w-32 aspect-[16/9] rounded-md overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue transition-all ${currentIndex === index ? 'ring-2 ring-primary-blue' : 'opacity-70 hover:opacity-100'}`}
                            >
                                <img src={img} alt={`Miniatura ${index + 1}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


const PropertyHeader: React.FC<{ property: Property }> = ({ property }) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
    <div>
      <h1 className="text-4xl font-bold text-slate-900">{property.title}</h1>
      <p className="text-slate-600 mt-2">{property.address}</p>
    </div>
    <div className="flex space-x-2 mt-4 sm:mt-0">
      <button className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors">
        <Share2Icon className="w-5 h-5 text-slate-600" />
        <span>Compartilhar</span>
      </button>
      <button className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors">
        <HeartIcon className="w-5 h-5 text-slate-600" />
        <span>Favoritar</span>
      </button>
    </div>
  </div>
);

const PropertyInfoBadges: React.FC<{ property: Property }> = ({ property }) => (
  <div className="flex flex-wrap gap-4 mt-6">
     <div className="flex items-center space-x-2 p-3 bg-slate-100 rounded-lg">
      <DollarSignIcon className="w-6 h-6 text-primary-blue" />
      <div>
        <div className="font-semibold text-slate-800">{property.purpose === PropertyPurpose.SALE ? 'Preço de Venda' : 'Aluguel Mensal'}</div>
      </div>
    </div>
    <div className="flex items-center space-x-2 p-3 bg-slate-100 rounded-lg">
      <BedIcon className="w-6 h-6 text-primary-blue" />
      <div>
        <div className="font-semibold text-slate-800">{property.bedrooms} Quartos</div>
      </div>
    </div>
     <div className="flex items-center space-x-2 p-3 bg-slate-100 rounded-lg">
      <BathIcon className="w-6 h-6 text-primary-blue" />
      <div>
        <div className="font-semibold text-slate-800">{property.bathrooms} Banheiros</div>
      </div>
    </div>
     <div className="flex items-center space-x-2 p-3 bg-slate-100 rounded-lg">
      <MaximizeIcon className="w-6 h-6 text-primary-blue" />
      <div>
        <div className="font-semibold text-slate-800">{property.areaM2} m²</div>
      </div>
    </div>
     <div className="flex items-center space-x-2 p-3 bg-slate-100 rounded-lg">
      <CheckCircleIcon className="w-6 h-6 text-primary-green" />
      <div>
        <div className="font-semibold text-slate-800">{property.repairQuality}</div>
        <div className="text-sm text-slate-500">Qualidade</div>
      </div>
    </div>
  </div>
);

const PropertyActionsCard: React.FC<{ property: Property }> = ({ property }) => {
    const [dateScheduled, setDateScheduled] = useState(false);
    const displayPrice = property.purpose === PropertyPurpose.SALE ? `R$ ${property.salePrice?.toLocaleString('pt-BR')}` : `R$ ${property.rentPrice?.toLocaleString('pt-BR')}`;
    const buttonText = property.purpose === PropertyPurpose.SALE ? 'Fazer Proposta' : 'Candidatar agora';
    
    const handleSchedule = () => {
        setDateScheduled(true);
        setTimeout(() => setDateScheduled(false), 3000);
    }

    return (
    <div className="p-6 border border-slate-200 rounded-lg shadow-lg sticky top-24">
        <p className="text-2xl font-bold text-slate-900">
            {displayPrice}
            {property.purpose === PropertyPurpose.RENT && <span className="text-base font-normal text-slate-500">/mês</span>}
        </p>
        <button className="w-full mt-6 bg-primary-green text-white font-semibold py-3 rounded-lg hover:opacity-95 transition-colors">
            {buttonText}
        </button>
        <div className="mt-6">
            <h4 className="font-semibold text-slate-800">Agendar uma visita</h4>
            <div className="flex space-x-2 mt-2">
                <button className="w-full py-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors">Presencial</button>
                <button className="w-full py-2 border border-slate-300 rounded-lg bg-slate-100 font-semibold">Virtual</button>
            </div>
            <div className="relative mt-4">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <CalendarIcon className="w-5 h-5 text-slate-400" />
                </span>
                <input type="date" className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-primary-blue focus:border-primary-blue" />
            </div>
             <button onClick={handleSchedule} className="w-full mt-4 bg-white text-primary-blue border border-primary-blue font-semibold py-3 rounded-lg hover:bg-primary-blue/10 transition-colors">
                {dateScheduled ? 'Visita Agendada!' : 'Agendar Visita'}
            </button>
            <p className="text-xs text-slate-500 mt-2 text-center">É grátis, sem obrigação - cancele a qualquer momento.</p>
        </div>
    </div>
    )
};

const PriceHistoryTable: React.FC<{ history: PriceHistory[] }> = ({ history }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead>
                <tr className="border-b border-slate-200">
                    <th className="p-4 font-semibold text-slate-600">Data</th>
                    <th className="p-4 font-semibold text-slate-600">Preço</th>
                    <th className="p-4 font-semibold text-slate-600">Evento</th>
                    <th className="p-4 font-semibold text-slate-600">Fonte</th>
                </tr>
            </thead>
            <tbody>
                {history.map(item => (
                    <tr key={item.id} className="border-b border-slate-200">
                        <td className="p-4 text-slate-800">{new Date(item.date).toLocaleDateString()}</td>
                        <td className="p-4 text-slate-800 font-medium">R$ {item.price.toLocaleString('pt-BR')}</td>
                        <td className="p-4 text-slate-800">{item.event}</td>
                        <td className="p-4 text-slate-800">{item.source}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);


const PropertyDetailsPage: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const { properties } = useProperties();
  const property = properties.find(p => p.id === propertyId);
  const similarProperties = properties.filter(p => p.id !== propertyId && p.city === property?.city).slice(0, 3);
  
  const [isLightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const goToPrevious = () => {
    setCurrentImageIndex(prevIndex => (prevIndex === 0 ? property!.images.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentImageIndex(prevIndex => (prevIndex === property!.images.length - 1 ? 0 : prevIndex + 1));
  };


  if (!property) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-2xl text-slate-600">Imóvel não encontrado</p>
      </div>
    );
  }

  return (
    <div className="bg-white pb-16 md:pb-0">
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PropertyHeader property={property} />
        <div className="mt-8">
            <ImageCarousel images={property.images} title={property.title} onImageClick={openLightbox} />
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
                <PropertyInfoBadges property={property}/>
                <hr className="my-8"/>
                <h2 className="text-2xl font-bold text-slate-900">Sobre este imóvel</h2>
                <p className="mt-4 text-slate-600 leading-relaxed">{property.description}</p>
                <hr className="my-8"/>
                <h2 className="text-2xl font-bold text-slate-900">Características e Comodidades</h2>
                <ul className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4">
                    {property.amenities.map((amenity, index) => (
                        <li key={index} className="flex items-center text-slate-700">
                            <CheckCircleIcon className="w-5 h-5 text-primary-green mr-3"/>
                            {amenity.name} {amenity.quantity > 1 ? `(${amenity.quantity})` : ''}
                        </li>
                    ))}
                </ul>
                {property.tourUrl && (
                    <>
                        <hr className="my-8"/>
                        <h2 className="text-2xl font-bold text-slate-900">Tour Virtual 3D</h2>
                        <div className="mt-6 aspect-[16/9] w-full bg-slate-200 rounded-lg overflow-hidden shadow-lg">
                           <iframe 
                                src={property.tourUrl} 
                                frameBorder="0" 
                                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen 
                                className="w-full h-full"
                                title={`${property.title} - Tour Virtual 3D`}
                                aria-label={`${property.title} - Tour Virtual 3D`}
                            ></iframe>
                        </div>
                    </>
                )}
                {property.priceHistory && property.priceHistory.length > 0 && (
                    <>
                        <hr className="my-8"/>
                        <h2 className="text-2xl font-bold text-slate-900">Histórico de Preço</h2>
                        <div className="mt-6">
                            <PriceHistoryTable history={property.priceHistory} />
                        </div>
                    </>
                )}
                <hr className="my-8"/>
                 <h2 className="text-2xl font-bold text-slate-900">Mapa</h2>
                 <div className="mt-6 h-96 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500">
                    <MapIcon className="w-16 h-16"/>
                    <p className="ml-4">Integração do Mapa aqui</p>
                 </div>
            </div>
            <div>
                <PropertyActionsCard property={property}/>
            </div>
        </div>

        <div className="mt-24">
            <h2 className="text-3xl font-extrabold text-slate-900">Imóveis Similares</h2>
            <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {similarProperties.map(p => (
                    <PropertyCard key={p.id} property={p} />
                ))}
            </div>
        </div>
      </main>
      <Footer />
      <BottomNavBar />

      {isLightboxOpen && (
          <Lightbox 
              images={property.images}
              currentIndex={currentImageIndex}
              onClose={closeLightbox}
              onPrev={goToPrevious}
              onNext={goToNext}
          />
      )}
    </div>
  );
};

export default PropertyDetailsPage;
