
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PropertyCard from '../../components/PropertyCard';
import { useProperties } from '../../contexts/PropertyContext';
import { useBrokers } from '../../contexts/BrokerContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { TESTIMONIALS, RENT_PRICE_RANGES, SALE_PRICE_RANGES, LOGO_URL } from '../../constants';
import { MapPinIcon, BuildingIcon, SearchIcon, ChevronDownIcon, PhoneIcon, MailIcon, DollarSignIcon, HashIcon, HandshakeIcon, HouseUserIcon, EyeIcon, LegalizationIcon, UserPlusIcon, StarIcon, UserCircleIcon, ChevronLeftIcon, ChevronRightIcon } from '../../components/Icons';
import { PropertyPurpose, PropertyType } from '../../types';
import AnimateOnScroll from '../../components/AnimateOnScroll';
import BottomNavBar from '../../components/BottomNavBar';
import { getOptimizedImageUrl } from '../../lib/localize';

const HeroSection = () => {
    const navigate = useNavigate();
    const { t, propertyTypes } = useLanguage();
    const { properties } = useProperties();
    const [searchPurpose, setSearchPurpose] = useState<PropertyPurpose>('RENT');
    const [searchTerm, setSearchTerm] = useState('');
    const [code, setCode] = useState('');
    const [propertyType, setPropertyType] = useState<PropertyType | 'any'>('any');
    const [city, setCity] = useState('any');
    const [neighborhood, setNeighborhood] = useState('any');
    const [priceRange, setPriceRange] = useState('any');

    const availableCities = useMemo(() => {
        if (!properties) return [];
        const allCities = properties.map(p => p.city.trim()).filter(Boolean);
        return ['any', ...Array.from(new Set(allCities)).sort()];
    }, [properties]);

    const availableNeighborhoods = useMemo(() => {
        if (!properties || city === 'any') return [];
        const neighborhoodsInCity = properties
            .filter(p => p.city === city)
            .map(p => p.neighborhood.trim())
            .filter(Boolean);
        return ['any', ...Array.from(new Set(neighborhoodsInCity)).sort()];
    }, [properties, city]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        params.append('purpose', searchPurpose);
        if (searchTerm) params.append('searchTerm', searchTerm);
        if (code) params.append('code', code);
        if (propertyType !== 'any') params.append('propertyType', propertyType);
        if (city !== 'any') params.append('city', city);
        if (neighborhood !== 'any') params.append('neighborhood', neighborhood);
        if (priceRange && priceRange !== 'any') {
            params.append('priceRange', priceRange);
        }
        
        navigate(`/search?${params.toString()}`);
    }

    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCity(e.target.value);
        setNeighborhood('any');
    };
    
    const handlePurposeChange = (purpose: PropertyPurpose) => {
        setSearchPurpose(purpose);
        setPriceRange('any');
    }
    
    const currentPriceRanges = searchPurpose === 'SALE' ? SALE_PRICE_RANGES : RENT_PRICE_RANGES;

  return (
    <div className="relative bg-emerald-800 overflow-hidden">
      <div className="absolute inset-0">
        <img src="https://emofviiywuhaxqoqowup.supabase.co/storage/v1/object/public/general-files/public/FUNDO.jpg" className="w-full h-full object-cover opacity-60" alt="Hero background" />
      </div>
      <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        <div className="text-center">
            <AnimateOnScroll>
                <img src={LOGO_URL} alt="Rezuski Imóveis Logo" className="h-32 mx-auto mb-6 object-contain" />
            </AnimateOnScroll>
            <AnimateOnScroll delay={50}>
                <h1 className="text-4xl md:text-6xl font-extrabold text-gray-50 leading-tight">
                {t('hero.title')}
                </h1>
            </AnimateOnScroll>
            <AnimateOnScroll delay={200}>
                <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-50">
                {t('hero.subtitle')}
                </p>
            </AnimateOnScroll>
        </div>

        <AnimateOnScroll delay={300}>
            <div className="mt-12 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
                <div className="flex border-b border-slate-200">
                    <button
                        onClick={() => handlePurposeChange('RENT')}
                        className={`px-6 py-4 font-semibold text-sm transition-colors w-1/3 rounded-tl-lg ${searchPurpose === 'RENT' ? 'bg-white text-primary-blue' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                        {t('search.rent')}
                    </button>
                    <button
                        onClick={() => handlePurposeChange('SALE')}
                        className={`px-6 py-4 font-semibold text-sm transition-colors w-1/3 border-x border-slate-200 ${searchPurpose === 'SALE' ? 'bg-white text-primary-blue' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                        {t('search.buy')}
                    </button>
                    <button
                        onClick={() => handlePurposeChange('SEASONAL')}
                        className={`px-6 py-4 font-semibold text-sm transition-colors w-1/3 rounded-tr-lg ${searchPurpose === 'SEASONAL' ? 'bg-white text-primary-blue' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                        {t('search.seasonal')}
                    </button>
                </div>
                <div className="p-6">
                    <form onSubmit={handleSearch}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('search.description')}</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <SearchIcon className="w-5 h-5 text-slate-400" />
                                    </span>
                                    <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={t('search.description.placeholder')} className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-primary-blue focus:border-primary-blue" />
                                </div>
                            </div>
                           <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('search.code')}</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <HashIcon className="w-5 h-5 text-slate-400" />
                                    </span>
                                    <input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder={t('search.code.placeholder')} className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-primary-blue focus:border-primary-blue" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('search.property_type')}</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <BuildingIcon className="w-5 h-5 text-slate-400" />
                                    </span>
                                    <select value={propertyType} onChange={e => setPropertyType(e.target.value as PropertyType | 'any')} className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-primary-blue focus:border-primary-blue appearance-none">
                                        <option value="any">{t('search.all_types')}</option>
                                        {propertyTypes.map(type => <option key={type.name} value={type.name}>{t(`propertyType:${type.name}`)}</option>)}
                                    </select>
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <ChevronDownIcon className="w-5 h-5 text-slate-400" />
                                    </span>
                                </div>
                            </div>
                           <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('search.city')}</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <MapPinIcon className="w-5 h-5 text-slate-400" />
                                    </span>
                                    <select value={city} onChange={handleCityChange} className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-primary-blue focus:border-primary-blue appearance-none">
                                        <option value="any">{t('search.all_cities')}</option>
                                        {availableCities.filter(c => c !== 'any').map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <ChevronDownIcon className="w-5 h-5 text-slate-400" />
                                    </span>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('search.neighborhood')}</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <MapPinIcon className="w-5 h-5 text-slate-400" />
                                    </span>
                                    <select value={neighborhood} onChange={e => setNeighborhood(e.target.value)} disabled={city === 'any' || availableNeighborhoods.length <= 1} className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-primary-blue focus:border-primary-blue appearance-none disabled:bg-slate-50">
                                        <option value="any">{t('search.all_neighborhoods')}</option>
                                        {availableNeighborhoods.filter(n => n !== 'any').map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                     <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <ChevronDownIcon className="w-5 h-5 text-slate-400" />
                                    </span>
                                </div>
                            </div>
                           
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('search.price')}</label>
                                 <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <DollarSignIcon className="w-5 h-5 text-slate-400" />
                                    </span>
                                    <select 
                                        name="priceRange" 
                                        value={priceRange} 
                                        onChange={e => setPriceRange(e.target.value)} 
                                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-primary-blue focus:border-primary-blue appearance-none"
                                    >
                                        {Object.entries(currentPriceRanges).map(([key, value]) => (
                                            <option key={key} value={key}>{value}</option>
                                        ))}
                                    </select>
                                     <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <ChevronDownIcon className="w-5 h-5 text-slate-400" />
                                    </span>
                                </div>
                            </div>
                            
                            <div className="md:col-span-3 mt-4">
                                <button type="submit" className="w-full flex items-center justify-center bg-primary-green text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:opacity-95 transition-all duration-200">
                                    <SearchIcon className="w-5 h-5 mr-2" />
                                    {t('search.button')}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AnimateOnScroll>
      </div>
    </div>
  );
}

const Section: React.FC<{
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  isGray?: boolean;
}> = ({ title, subtitle, children, isGray }) => (
  <div className={`py-24 ${isGray ? 'bg-slate-50' : 'bg-white'}`}>
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
      <AnimateOnScroll>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900">{title}</h2>
          {subtitle && <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600">{subtitle}</p>}
        </div>
      </AnimateOnScroll>
      {children}
    </div>
  </div>
);


const RecentProperties: React.FC = () => {
    const { properties, loading } = useProperties();
    const { t } = useLanguage();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const autoScrollIntervalRef = useRef<number | null>(null);

    const recentProperties = [...properties]
        .filter(p => p.status === 'AVAILABLE')
        .slice(0, 9);
    
    const scrollAmount = 350;

    const startAutoScroll = useCallback(() => {
        if (autoScrollIntervalRef.current) return; // Already running
        autoScrollIntervalRef.current = window.setInterval(() => {
            if (scrollContainerRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
                if (scrollLeft + clientWidth >= scrollWidth - 1) { // -1 for precision
                    scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                }
            }
        }, 5000);
    }, [scrollAmount]);
    
    const stopAutoScroll = () => {
        if (autoScrollIntervalRef.current) {
            clearInterval(autoScrollIntervalRef.current);
            autoScrollIntervalRef.current = null;
        }
    };

    useEffect(() => {
        if(recentProperties.length > 3) {
             startAutoScroll();
        }
        return () => stopAutoScroll();
    }, [startAutoScroll, recentProperties.length]);

    const handleMouseEnter = () => stopAutoScroll();
    const handleMouseLeave = () => {
        if(recentProperties.length > 3) {
            startAutoScroll();
        }
    };
    
    const handleScroll = (direction: 'left' | 'right') => {
        stopAutoScroll();
        if (scrollContainerRef.current) {
            const amount = direction === 'left' ? -scrollAmount : scrollAmount;
            scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
        }
    };
    
    if (loading) {
        return (
             <Section title={t('section.recent')} isGray={true}>
                 <div className="flex space-x-8 -mx-4 px-4">
                     {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="flex-shrink-0 w-full sm:w-1/2 md:w-1/3">
                            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden animate-pulse">
                                <div className="w-full h-52 bg-slate-200"></div>
                                <div className="p-5 space-y-4">
                                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                    <div className="h-6 bg-slate-200 rounded w-1/2"></div>
                                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                                    <div className="pt-4 flex justify-between">
                                        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                                        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                                        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                                    </div>
                                    <div className="h-10 bg-slate-200 rounded-lg mt-4"></div>
                                </div>
                            </div>
                        </div>
                     ))}
                 </div>
            </Section>
        );
    }
    
    if (recentProperties.length === 0) {
        return null;
    }

    const showNavButtons = recentProperties.length > 3;

    return (
        <Section title={t('section.recent')} subtitle={t('section.recent.subtitle')} isGray={true}>
             <div 
                className="relative -mx-4 group"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
             >
                <div 
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto space-x-8 pb-4 px-4 snap-x snap-mandatory hide-scrollbar"
                >
                    {recentProperties.map((property, index) => (
                        <div key={property.id} className="snap-center md:snap-start flex-shrink-0 w-11/12 sm:w-[calc(50%-1rem)] md:w-[calc(33.333%-1.34rem)]" style={{minWidth: '320px'}}>
                            <AnimateOnScroll delay={100 * (index + 1)}>
                                <PropertyCard property={property} />
                            </AnimateOnScroll>
                        </div>
                    ))}
                </div>
                
                {showNavButtons && (
                    <>
                        <button 
                            onClick={() => handleScroll('left')} 
                            className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100"
                            aria-label="Scroll left"
                        >
                            <ChevronLeftIcon className="w-6 h-6 text-slate-700" />
                        </button>
                        <button 
                            onClick={() => handleScroll('right')} 
                            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100"
                            aria-label="Scroll right"
                        >
                            <ChevronRightIcon className="w-6 h-6 text-slate-700" />
                        </button>
                    </>
                )}
            </div>
        </Section>
    );
};

const Categories: React.FC = () => {
    const { categories } = useLanguage();
    const { t } = useLanguage();
    return (
        <Section title={t('section.categories')} isGray={false}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8">
                {categories.map((cat, index) => (
                    <AnimateOnScroll key={cat.id} delay={100 * (index + 1)}>
                        <Link to={`/search?categoryId=${cat.id}`} className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                            <img src={getOptimizedImageUrl(cat.iconUrl, { width: 64, height: 64 })} alt={t(`category:${cat.id}`)} className="w-16 h-16" />
                            <p className="mt-4 font-semibold text-slate-700 text-center">{t(`category:${cat.id}`)}</p>
                        </Link>
                    </AnimateOnScroll>
                ))}
            </div>
        </Section>
    );
};

const ServicesSection: React.FC = () => {
    const { t } = useLanguage();
    const services = [
        { name: t('services.sale'), Icon: HandshakeIcon },
        { name: t('services.rent'), Icon: HouseUserIcon },
        { name: t('services.evaluation'), Icon: EyeIcon },
        { name: t('services.legalization'), Icon: LegalizationIcon },
        { name: t('services.inspection'), Icon: SearchIcon },
        { name: t('services.partners'), Icon: UserPlusIcon },
    ];

    return (
        <Section title={t('section.services')} isGray={false}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-x-4 gap-y-8 justify-items-center">
                {services.map(({ name, Icon }, index) => (
                     <AnimateOnScroll key={name} delay={100 * index} className="w-full">
                        <div className="flex flex-col items-center space-y-3 text-center group w-full p-2 rounded-lg hover:bg-slate-100 transition-colors">
                            <Icon className={`w-10 h-10 text-slate-800`}/>
                            <p className="font-medium text-slate-700 group-hover:text-primary-blue transition-colors min-h-[2.5rem] flex items-center justify-center">
                                {name}
                            </p>
                        </div>
                    </AnimateOnScroll>
                ))}
            </div>
        </Section>
    );
};

const PropertiesForPurpose: React.FC<{ title: string; purpose: PropertyPurpose; isGray?: boolean }> = ({ title, purpose, isGray }) => {
    const { properties } = useProperties();
    const { t } = useLanguage();
    const filteredProperties = properties.filter(p => p.purpose === purpose && p.status === 'AVAILABLE').slice(0, 6);
    
    if(filteredProperties.length === 0) return null;

    return (
        <Section title={title} isGray={isGray}>
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProperties.map((property, index) => (
                    <AnimateOnScroll key={property.id} delay={100 * (index + 1)}>
                       <PropertyCard property={property} />
                    </AnimateOnScroll>
                ))}
            </div>
            <AnimateOnScroll delay={300}>
                <div className="text-center mt-12">
                    <Link to={`/search?purpose=${purpose}`} className="inline-block bg-primary-green text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:opacity-95 transition-all">
                        {t('section.see_more')}
                    </Link>
                </div>
            </AnimateOnScroll>
        </Section>
    );
};

const MeetTheBrokers: React.FC = () => {
    const { brokers } = useBrokers();
    const { t } = useLanguage();
    return (
    <Section title={t('section.brokers')} subtitle={t('section.brokers.subtitle')} isGray={true}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {brokers.map((broker, index) => (
                <AnimateOnScroll key={broker.id} delay={100 * (index + 1)}>
                    <div className="bg-white p-6 rounded-lg shadow-sm text-center hover:shadow-lg transition-shadow h-full border border-slate-100">
                        <img src={getOptimizedImageUrl(broker.avatarUrl, { width: 96, height: 96 })} alt={broker.name} className="w-24 h-24 rounded-full mx-auto object-cover" />
                        <h3 className="mt-4 text-lg font-semibold text-slate-800">{broker.name}</h3>
                        <p className="text-sm text-primary-blue font-medium">{broker.title}</p>
                        <div className="mt-4 flex justify-center space-x-3">
                            <a href={`tel:${broker.phone}`} className="text-slate-400 hover:text-primary-blue"><PhoneIcon /></a>
                            <a href={`mailto:${broker.email}`} className="text-slate-400 hover:text-primary-blue"><MailIcon /></a>
                        </div>
                    </div>
                </AnimateOnScroll>
            ))}
        </div>
    </Section>
    )
};

const Testimonials: React.FC = () => {
    const { t } = useLanguage();
    return (
    <Section title={t('section.testimonials')} isGray={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
                <AnimateOnScroll key={testimonial.id} delay={100 * (index + 1)}>
                    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col border border-slate-200">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0 bg-primary-blue/10 p-2 rounded-full">
                                <UserCircleIcon className="w-8 h-8 text-primary-blue" />
                            </div>
                            <div className="ml-4">
                                <p className="font-semibold text-slate-800">{testimonial.authorName}</p>
                                <p className="text-sm text-slate-500">{testimonial.authorTitle}</p>
                            </div>
                        </div>
                        <p className="text-slate-600 flex-grow mb-4">{testimonial.text}</p>
                        <div className="flex items-center mt-auto">
                            <StarIcon className="w-5 h-5 text-yellow-400 fill-current" />
                            <StarIcon className="w-5 h-5 text-yellow-400 fill-current" />
                            <StarIcon className="w-5 h-5 text-yellow-400 fill-current" />
                            <StarIcon className="w-5 h-5 text-yellow-400 fill-current" />
                            <StarIcon className="w-5 h-5 text-yellow-400 fill-current" />
                        </div>
                    </div>
                </AnimateOnScroll>
            ))}
        </div>
    </Section>
)};

const ContactSection: React.FC = () => {
    const { t } = useLanguage();
    const [formState, setFormState] = useState({ name: '', email: '', message: '' });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormState(prev => ({ ...prev, [id]: value }));
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const subject = `Nova Mensagem de Contato de ${formState.name}`;
        const body = `Nome: ${formState.name}\nEmail: ${formState.email}\n\nMensagem:\n${formState.message}`;
        const mailtoLink = `mailto:rezuski.imoveis@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
    };

    return (
        <div className="bg-primary-blue text-white">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                 <AnimateOnScroll>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl font-extrabold">{t('contact.title')}</h2>
                            <p className="mt-4 text-lg text-white/70">{t('contact.subtitle')}</p>
                            <div className="mt-8 space-y-4">
                                <div className="flex items-start">
                                    <MapPinIcon className="w-6 h-6 text-white/80 mt-1 flex-shrink-0" />
                                    <p className="ml-4">Rua Romeu Caetano Guida, n0140, salas 02 e 03, Campo do Prado, Cachoeiras de Macacu. RJ - CEP: 28681-320</p>
                                </div>
                                <div className="flex items-center">
                                    <PhoneIcon className="w-6 h-6 text-white/80" />
                                    <p className="ml-4">(021) 96756-7178</p>
                                </div>
                                <div className="flex items-center">
                                    <MailIcon className="w-6 h-6 text-white/80" />
                                    <p className="ml-4">rezuski.imoveis@gmail.com</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-lg shadow-2xl">
                            <form onSubmit={handleFormSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="text-sm font-medium text-slate-700">{t('contact.form.name')}</label>
                                    <input type="text" id="name" value={formState.name} onChange={handleInputChange} required className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-md text-slate-900 focus:ring-primary-green focus:border-primary-green" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="text-sm font-medium text-slate-700">{t('contact.form.email')}</label>
                                    <input type="email" id="email" value={formState.email} onChange={handleInputChange} required className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-md text-slate-900 focus:ring-primary-green focus:border-primary-green" />
                                </div>
                                <div>
                                    <label htmlFor="message" className="text-sm font-medium text-slate-700">{t('contact.form.message')}</label>
                                    <textarea id="message" rows={4} value={formState.message} onChange={handleInputChange} required className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-md text-slate-900 focus:ring-primary-green focus:border-primary-green"></textarea>
                                </div>
                                <button type="submit" className="w-full bg-primary-green text-white font-semibold py-3 rounded-lg hover:opacity-95 transition-colors">{t('contact.form.send')}</button>
                            </form>
                        </div>
                    </div>
                 </AnimateOnScroll>
            </div>
        </div>
    );
};

const HomePage: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="bg-white pb-16 md:pb-0">
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <RecentProperties />
        <Categories />
        <PropertiesForPurpose title={t('section.for_sale')} purpose={'SALE'} isGray={true} />
        <PropertiesForPurpose title={t('section.for_rent')} purpose={'RENT'} isGray={false} />
        <MeetTheBrokers />
        <Testimonials />
        <ContactSection />
      </main>
      <Footer />
      <BottomNavBar />
    </div>
  );
};

export default HomePage;