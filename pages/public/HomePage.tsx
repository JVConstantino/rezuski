
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PropertyCard from '../../components/PropertyCard';
import { useProperties } from '../../contexts/PropertyContext';
import { useBrokers } from '../../contexts/BrokerContext';
import { useCategories } from '../../contexts/CategoryContext';
import { TESTIMONIALS, RENT_PRICE_RANGES, SALE_PRICE_RANGES, LOGO_URL } from '../../constants';
import { MapPinIcon, BuildingIcon, SearchIcon, ChevronDownIcon, QuoteIcon, PhoneIcon, MailIcon, DollarSignIcon, HashIcon, HandshakeIcon, HouseUserIcon, EyeIcon, LegalizationIcon, UserPlusIcon } from '../../components/Icons';
import { PropertyPurpose } from '../../types';
import AnimateOnScroll from '../../components/AnimateOnScroll';
import BottomNavBar from '../../components/BottomNavBar';

const HeroSection = () => {
    const navigate = useNavigate();
    const [searchPurpose, setSearchPurpose] = useState<PropertyPurpose>('RENT');
    const [location, setLocation] = useState('');
    const [priceRange, setPriceRange] = useState('any');
    const [code, setCode] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        params.append('purpose', searchPurpose);
        if (location) params.append('location', location);
        if (code) params.append('code', code);
        if (priceRange && priceRange !== 'any') {
            params.append('priceRange', priceRange);
        }
        
        navigate(`/search?${params.toString()}`);
    }
    
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
                Dê o próximo passo!
                </h1>
            </AnimateOnScroll>
            <AnimateOnScroll delay={200}>
                <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-50">
                Aqui você está conectado com os melhores imóveis da Região!
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
                        ALUGAR
                    </button>
                    <button
                        onClick={() => handlePurposeChange('SALE')}
                        className={`px-6 py-4 font-semibold text-sm transition-colors w-1/3 border-x border-slate-200 ${searchPurpose === 'SALE' ? 'bg-white text-primary-blue' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                        COMPRAR
                    </button>
                    <button
                        onClick={() => handlePurposeChange('SEASONAL')}
                        className={`px-6 py-4 font-semibold text-sm transition-colors w-1/3 rounded-tr-lg ${searchPurpose === 'SEASONAL' ? 'bg-white text-primary-blue' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                        TEMPORADA
                    </button>
                </div>
                <div className="p-6">
                    <form onSubmit={handleSearch}>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nome ou Localização</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <MapPinIcon className="w-5 h-5 text-slate-400" />
                                    </span>
                                    <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Digite um nome, bairro ou cidade..." className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-primary-blue focus:border-primary-blue" />
                                </div>
                            </div>
                           
                             <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Código</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <HashIcon className="w-5 h-5 text-slate-400" />
                                    </span>
                                    <input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="Código do imóvel" className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-primary-blue focus:border-primary-blue" />
                                </div>
                            </div>

                            <div className="md:col-span-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Faixa de Preço</label>
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
                            
                            <div className="md:col-span-4 mt-4">
                                <button type="submit" className="w-full flex items-center justify-center bg-primary-green text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:opacity-95 transition-all duration-200">
                                    <SearchIcon className="w-5 h-5 mr-2" />
                                    Buscar
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
    
    // Sort by viewCount descending and take the top properties
    const popular = [...properties]
        .filter(p => p.viewCount && p.viewCount > 0 && p.status === 'AVAILABLE')
        .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
        .slice(0, 3);

    if (loading) {
        return (
             <Section title="Imóveis mais buscados" isGray={true}>
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
        <Section title="Imóveis mais buscados" subtitle="Os imóveis que estão recebendo mais atenção em nossa plataforma." isGray={true}>
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
    const { categories } = useCategories();
    return (
        <Section title="Explore por Categoria" isGray={false}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8">
                {categories.map((cat, index) => (
                    <AnimateOnScroll key={cat.id} delay={100 * (index + 1)}>
                        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                            <img src={cat.iconUrl} alt={cat.name} className="w-16 h-16" />
                            <p className="mt-4 font-semibold text-slate-700">{cat.name}</p>
                        </div>
                    </AnimateOnScroll>
                ))}
            </div>
        </Section>
    );
};

const ServicesSection: React.FC = () => {
    const services = [
        { name: 'Venda', Icon: HandshakeIcon },
        { name: 'Locação', Icon: HouseUserIcon },
        { name: 'Avaliação', Icon: EyeIcon },
        { name: 'Legalização', Icon: LegalizationIcon },
        { name: 'Vistoria Imobiliária', Icon: SearchIcon },
        { name: 'Ver parceiros', Icon: UserPlusIcon },
    ];

    return (
        <Section title="Nossos serviços" isGray={false}>
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
                        Ver Mais
                    </Link>
                </div>
            </AnimateOnScroll>
        </Section>
    );
};

const MeetTheBrokers: React.FC = () => {
    const { brokers } = useBrokers();
    return (
    <Section title="Conheça Nossos Corretores" subtitle="Nossa equipe de especialistas está pronta para te ajudar a encontrar o imóvel ideal." isGray={true}>
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

const Testimonials: React.FC = () => (
    <Section title="O que nossos clientes dizem" isGray={false}>
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
);

const ContactSection: React.FC = () => (
    <div className="bg-primary-blue text-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
             <AnimateOnScroll>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl font-extrabold">Entre em Contato</h2>
                        <p className="mt-4 text-lg text-white/70">Tem alguma pergunta ou quer agendar uma visita? Nossa equipe está pronta para te ajudar. Preencha o formulário ou visite nosso escritório.</p>
                        <div className="mt-8 space-y-4">
                            <div className="flex items-center">
                                <MapPinIcon className="w-6 h-6 text-white/80" />
                                <p className="ml-4">Rua Principal, 123, Centro, São Paulo - SP</p>
                            </div>
                            <div className="flex items-center">
                                <PhoneIcon className="w-6 h-6 text-white/80" />
                                <p className="ml-4">+55 (11) 5555-4444</p>
                            </div>
                            <div className="flex items-center">
                                <MailIcon className="w-6 h-6 text-white/80" />
                                <p className="ml-4">contato@rezuski.com</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-lg shadow-2xl">
                        <form className="space-y-6">
                            <div>
                                <label htmlFor="name" className="text-sm font-medium text-slate-700">Nome</label>
                                <input type="text" id="name" className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-md text-slate-900 focus:ring-primary-green focus:border-primary-green" />
                            </div>
                            <div>
                                <label htmlFor="email" className="text-sm font-medium text-slate-700">Email</label>
                                <input type="email" id="email" className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-md text-slate-900 focus:ring-primary-green focus:border-primary-green" />
                            </div>
                            <div>
                                <label htmlFor="message" className="text-sm font-medium text-slate-700">Mensagem</label>
                                <textarea id="message" rows={4} className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-md text-slate-900 focus:ring-primary-green focus:border-primary-green"></textarea>
                            </div>
                            <button type="submit" className="w-full bg-primary-green text-white font-semibold py-3 rounded-lg hover:opacity-95 transition-colors">Enviar Mensagem</button>
                        </form>
                    </div>
                </div>
             </AnimateOnScroll>
        </div>
    </div>
);

const HomePage: React.FC = () => {
  return (
    <div className="bg-white pb-16 md:pb-0">
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <PopularProperties />
        <Categories />
        <PropertiesForPurpose title="Imóveis à Venda" purpose={'SALE'} isGray={true} />
        <PropertiesForPurpose title="Imóveis para Alugar" purpose={'RENT'} isGray={false} />
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