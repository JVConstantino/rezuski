

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PropertyCard from '../../components/PropertyCard';
import { useProperties } from '../../contexts/PropertyContext';
import { Share2Icon, MapIcon, BedIcon, BathIcon, MaximizeIcon, CheckCircleIcon, CalendarIcon, ChevronLeftIcon, ChevronRightIcon, XIcon, DollarSignIcon } from '../../components/Icons';
import { Property, PriceHistory } from '../../types';
import BottomNavBar from '../../components/BottomNavBar';
import { useLanguage } from '../../contexts/LanguageContext';
import { localizeProperty } from '../../lib/localize';

declare var mapboxgl: any;

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


const PropertyHeader: React.FC<{ property: Property; onShare: () => void }> = ({ property, onShare }) => {
    const { t } = useLanguage();
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
            <h1 className="text-4xl font-bold text-slate-900">{property.title}</h1>
            <p className="text-slate-600 mt-2">{property.address}</p>
            </div>
            <div className="flex space-x-2 mt-4 sm:mt-0">
            <button onClick={onShare} className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors">
                <Share2Icon className="w-5 h-5 text-slate-600" />
                <span>{t('details.share')}</span>
            </button>
            </div>
        </div>
    );
};

const PropertyInfoBadges: React.FC<{ property: Property }> = ({ property }) => {
    const { t } = useLanguage();
    return (
    <div className="flex flex-wrap gap-4 mt-6">
        <div className="flex items-center space-x-2 p-3 bg-slate-100 rounded-lg">
        <DollarSignIcon className="w-6 h-6 text-primary-blue" />
        <div>
            <div className="font-semibold text-slate-800">{property.purpose === 'SALE' ? t('details.sale_price') : t('details.rent_price')}</div>
        </div>
        </div>
        <div className="flex items-center space-x-2 p-3 bg-slate-100 rounded-lg">
        <BedIcon className="w-6 h-6 text-primary-blue" />
        <div>
            <div className="font-semibold text-slate-800">{property.bedrooms} {t('details.bedrooms')}</div>
        </div>
        </div>
        <div className="flex items-center space-x-2 p-3 bg-slate-100 rounded-lg">
        <BathIcon className="w-6 h-6 text-primary-blue" />
        <div>
            <div className="font-semibold text-slate-800">{property.bathrooms} {t('details.bathrooms')}</div>
        </div>
        </div>
        <div className="flex items-center space-x-2 p-3 bg-slate-100 rounded-lg">
        <MaximizeIcon className="w-6 h-6 text-primary-blue" />
        <div>
            <div className="font-semibold text-slate-800">{property.areaM2} {t('details.area')}</div>
        </div>
        </div>
        <div className="flex items-center space-x-2 p-3 bg-slate-100 rounded-lg">
        <CheckCircleIcon className="w-6 h-6 text-primary-green" />
        <div>
            <div className="font-semibold text-slate-800">{property.repairQuality}</div>
            <div className="text-sm text-slate-500">{t('details.quality')}</div>
        </div>
        </div>
    </div>
    );
};

const PropertyActionsCard: React.FC<{ property: Property }> = ({ property }) => {
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const { t } = useLanguage();

    const displayPrice = property.purpose === 'SALE' 
        ? `R$ ${property.salePrice?.toLocaleString('pt-BR')}` 
        : `R$ ${property.rentPrice?.toLocaleString('pt-BR')}`;
    
    const handleScheduleViaWhatsApp = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !date) {
            alert('Por favor, preencha seu nome e a data para agendar a visita.');
            return;
        }

        const recipientPhone = "5521967567178"; // Rezuski Imóveis phone number
        
        const visitDate = new Date(date + 'T12:00:00Z');
        const formattedDate = visitDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

        const message = `Olá! Tenho interesse em agendar uma visita para o imóvel "${property.title}" (Cód: ${property.code || 'N/A'}).

Nome: ${name}
Data Sugerida: ${formattedDate}

Agradeço o retorno.`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${recipientPhone}?text=${encodedMessage}`;
        
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div className="p-6 border border-slate-200 rounded-lg shadow-lg sticky top-24">
            <p className="text-2xl font-bold text-slate-900">
                {displayPrice}
                {property.purpose !== 'SALE' && <span className="text-base font-normal text-slate-500">/{property.purpose === 'RENT' ? 'mês' : 'diária'}</span>}
            </p>
            
            <form onSubmit={handleScheduleViaWhatsApp} className="mt-6 space-y-4">
                <h4 className="font-semibold text-slate-800">{t('details.schedule_visit')}</h4>
                
                <div>
                    <label htmlFor="visitor-name" className="sr-only">{t('details.your_name')}</label>
                    <input type="text" id="visitor-name" placeholder={t('details.your_name')} value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-primary-blue focus:border-primary-blue" />
                </div>

                <div>
                    <label htmlFor="visitor-date" className="sr-only">{t('details.visit_date')}</label>
                     <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <CalendarIcon className="w-5 h-5 text-slate-400" />
                        </span>
                        <input type="date" id="visitor-date" value={date} onChange={e => setDate(e.target.value)} required className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-primary-blue focus:border-primary-blue" min={new Date().toISOString().split("T")[0]}/>
                    </div>
                </div>

                <button type="submit" className="w-full mt-2 bg-green-500 text-white font-semibold py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943s-.182-.15-.38-.25"/></svg>
                    <span>{t('details.schedule_whatsapp')}</span>
                </button>
            </form>
        </div>
    );
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
  const { properties, incrementViewCount } = useProperties();
  const { locale, t } = useLanguage();
  
  const originalProperty = properties.find(p => p.id === propertyId);
  const property = originalProperty ? localizeProperty(originalProperty, locale) : undefined;
  
  const similarProperties = properties
    .filter(p => p.id !== propertyId && p.city === property?.city)
    .slice(0, 3);
  
  const [isLightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showCopiedNotification, setShowCopiedNotification] = useState(false);

  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<any>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);

  useEffect(() => {
    if (propertyId) {
        incrementViewCount(propertyId);
    }
  }, [propertyId, incrementViewCount]);

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
  
  useEffect(() => {
    if (map.current || !property || !mapContainer.current) return;

    const fullAddress = `${property.address}, ${property.neighborhood}, ${property.city}, ${property.state}, ${property.zipCode}`;
    const mapboxToken = 'pk.eyJ1Ijoiam9hbzAyMTIiLCJhIjoiY2t1MnByc2Z4MTNvazJ2cXJwaHlqOGdteiJ9.cW_NceC9Jo4smWPBMBkEgA';
    mapboxgl.accessToken = mapboxToken;

    const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(fullAddress)}.json?access_token=${mapboxToken}&limit=1`;
    
    fetch(geocodeUrl)
        .then(response => response.json())
        .then(data => {
            if (data.features && data.features.length > 0) {
                const coordinates = data.features[0].center;
                setMapError(null);
                
                map.current = new mapboxgl.Map({
                    container: mapContainer.current!,
                    style: 'mapbox://styles/mapbox/streets-v12',
                    center: coordinates,
                    zoom: 15
                });
                
                map.current.addControl(new mapboxgl.NavigationControl());
                new mapboxgl.Marker({ color: '#2A7ADA' }).setLngLat(coordinates).addTo(map.current);
                
                setIsMapLoading(false);
            } else {
                setMapError('Não foi possível encontrar as coordenadas para este endereço.');
                setIsMapLoading(false);
            }
        })
        .catch(err => {
            console.error('Error fetching geocoding data:', err);
            setMapError('Erro ao carregar o mapa. Verifique a conexão.');
            setIsMapLoading(false);
        });
        
    return () => {
        if (map.current) {
            map.current.remove();
            map.current = null;
        }
    };
}, [property]);

  const handleShare = async () => {
    if (!property) return;

    const urlToShare = new URL(window.location.href).href;

    const shareData = {
      title: `Confira este imóvel: ${property.title}`,
      text: property.description.substring(0, 120) + '...',
      url: urlToShare,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      }
    } else {
      navigator.clipboard.writeText(urlToShare).then(() => {
        setShowCopiedNotification(true);
        setTimeout(() => setShowCopiedNotification(false), 3000);
      }).catch(err => {
        console.error('Falha ao copiar o link:', err);
        alert('Não foi possível copiar o link.');
      });
    }
  };


  if (!property) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-2xl text-slate-600">{t('property.not_found')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white pb-16 md:pb-0">
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PropertyHeader property={property} onShare={handleShare} />
        <div className="mt-8">
            <ImageCarousel images={property.images} title={property.title} onImageClick={openLightbox} />
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
                <PropertyInfoBadges property={property}/>
                <hr className="my-8"/>
                <h2 className="text-2xl font-bold text-slate-900">{t('details.about_property')}</h2>
                <p className="mt-4 text-slate-600 leading-relaxed whitespace-pre-wrap">{property.description}</p>
                <hr className="my-8"/>
                <h2 className="text-2xl font-bold text-slate-900">{t('details.features_amenities')}</h2>
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
                        <h2 className="text-2xl font-bold text-slate-900">{t('details.virtual_tour')}</h2>
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
                        <h2 className="text-2xl font-bold text-slate-900">{t('details.price_history')}</h2>
                        <div className="mt-6">
                            <PriceHistoryTable history={property.priceHistory} />
                        </div>
                    </>
                )}
                <hr className="my-8"/>
                 <h2 className="text-2xl font-bold text-slate-900">{t('details.map')}</h2>
                 <div className="relative mt-6 h-96 w-full rounded-lg bg-slate-200">
                    <div ref={mapContainer} className="w-full h-full rounded-lg" />
                    {(isMapLoading || mapError) && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-200 rounded-lg text-center p-4">
                            {isMapLoading && !mapError && <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>}
                            {mapError && (
                                <>
                                <MapIcon className="w-12 h-12 text-slate-400 mb-2"/>
                                <p className="text-slate-600 font-semibold">{mapError}</p>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div>
                <PropertyActionsCard property={property}/>
            </div>
        </div>

        <div className="mt-24">
            <h2 className="text-3xl font-extrabold text-slate-900">{t('details.similar_properties')}</h2>
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

      {showCopiedNotification && (
          <div className="fixed bottom-24 md:bottom-10 right-10 bg-slate-900 text-white px-5 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300">
              {t('details.link_copied')}
          </div>
      )}
    </div>
  );
};

export default PropertyDetailsPage;