
import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PropertyCard from '../../components/PropertyCard';
import { useProperties } from '../../contexts/PropertyContext';
import { useBrokers } from '../../contexts/BrokerContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { TESTIMONIALS, RENT_PRICE_RANGES, SALE_PRICE_RANGES, LOGO_URL } from '../../constants';
import { MapPinIcon, BuildingIcon, SearchIcon, ChevronDownIcon, QuoteIcon, PhoneIcon, MailIcon, DollarSignIcon, HashIcon, HandshakeIcon, HouseUserIcon, EyeIcon, LegalizationIcon, UserPlusIcon } from '../../components/Icons';
import { PropertyPurpose, PropertyType } from '../../types';
import AnimateOnScroll from '../../components/AnimateOnScroll';
import BottomNavBar from '../../components/BottomNavBar';

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
                <img src={LOGO_URL} alt="Rezuski Imóveis Logo" className="h-24 mx-auto mb-6 object-contain" />
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


const PopularProperties: React.FC = () => {
    const { properties, loading } = useProperties();
    const { t } = useLanguage();
    
    // Sort by viewCount descending and take the top properties
    const popular = [...properties]
        .filter(p => p.viewCount && p.viewCount > 0 && p.status === 'AVAILABLE')
        .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
        .slice(0, 3);

    if (loading) {
        return (
             <Section title={t('section.popular')} isGray={true}>
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                     {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden animate-pulse">
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
                     ))}
                 </div>
            </Section>
        );
    }
    
    if (popular.length === 0) {
        return null; // Don't render the section if there are no popular properties
    }

    return (
        <Section title={t('section.popular')} subtitle={t('section.popular.subtitle')} isGray={true}>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {popular.map((property, index) => (
                    <AnimateOnScroll key={property.id} delay={100 * (index + 1)}>
                        <PropertyCard property={property} />
                    </AnimateOnScroll>
                ))}
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
                        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                            <img src={cat.iconUrl} alt={t(`category:${cat.id}`)} className="w-16 h-16" />
                            <p className="mt-4 font-semibold text-slate-700">{t(`category:${cat.id}`)}</p>
                        </div>
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
                        <a href="#" className="flex flex-col items-center space-y-3 text-center group w-full p-2 rounded-lg hover:bg-slate-100 transition-colors">
                            <Icon className={`w-10 h-10 text-slate-800`}/>
                            <p className="font-medium text-slate-700 group-hover:text-primary-blue transition-colors min-h-[2.5rem] flex items-center justify-center">
                                {name}
                            </p>
                        </a>
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
                        <img src={broker.avatarUrl} alt={broker.name} className="w-24 h-24 rounded-full mx-auto" />
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
    <Section title={t('section.testimonials')} isGray={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
                <AnimateOnScroll key={testimonial.id} delay={100 * (index + 1)}>
                    <div className="bg-white p-8 rounded-lg shadow-sm h-full flex flex-col border border-slate-100">
                        <QuoteIcon className="w-8 h-8 text-primary-blue/30" />
                        <p className="mt-4 text-slate-600 flex-grow">"{testimonial.text}"</p>
                        <div className="mt-6 flex items-center">
                            <img src={testimonial.avatarUrl} alt={testimonial.authorName} className="w-12 h-12 rounded-full" />
                            <div className="ml-4">
                                <p className="font-semibold text-slate-800">{testimonial.authorName}</p>
                                <p className="text-sm text-slate-500">{testimonial.authorTitle}</p>
                            </div>
                        </div>
                    </div>
                </AnimateOnScroll>
            ))}
        </div>
    </Section>
)};

const ContactSection: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="bg-primary-blue text-white">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                 <AnimateOnScroll>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl font-extrabold">{t('contact.title')}</h2>
                            <p className="mt-4 text-lg text-white/70">{t('contact.subtitle')}</p>
                            <div className="mt-8 space-y-4">
                                <div className="flex items-center">
                                    <MapPinIcon className="w-6 h-6 text-white/80" />
                                    <p className="ml-4">{t('contact.address_label')}</p>
                                </div>
                                <div className="flex items-center">
                                    <PhoneIcon className="w-6 h-6 text-white/80" />
                                    <p className="ml-4">{t('contact.phone_label')}</p>
                                </div>
                                <div className="flex items-center">
                                    <MailIcon className="w-6 h-6 text-white/80" />
                                    <p className="ml-4">{t('contact.email_label')}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-lg shadow-2xl">
                            <form className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="text-sm font-medium text-slate-700">{t('contact.form.name')}</label>
                                    <input type="text" id="name" className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-md text-slate-900 focus:ring-primary-green focus:border-primary-green" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="text-sm font-medium text-slate-700">{t('contact.form.email')}</label>
                                    <input type="email" id="email" className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-md text-slate-900 focus:ring-primary-green focus:border-primary-green" />
                                </div>
                                <div>
                                    <label htmlFor="message" className="text-sm font-medium text-slate-700">{t('contact.form.message')}</label>
                                    <textarea id="message" rows={4} className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-md text-slate-900 focus:ring-primary-green focus:border-primary-green"></textarea>
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
        <PopularProperties />
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