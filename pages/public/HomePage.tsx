
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PropertyCard from '../../components/PropertyCard';
import { useProperties } from '../../contexts/PropertyContext';
import { useBrokers } from '../../contexts/BrokerContext';
import { useCategories } from '../../contexts/CategoryContext';
import { TESTIMONIALS } from '../../constants';
import { MapPinIcon, BuildingIcon, SearchIcon, ChevronDownIcon, QuoteIcon, PhoneIcon, MailIcon, DollarSignIcon, HashIcon, HandshakeIcon, HouseUserIcon, EyeIcon, LegalizationIcon, UserPlusIcon } from '../../components/Icons';
import { PropertyPurpose } from '../../types';
import AnimateOnScroll from '../../components/AnimateOnScroll';
import BottomNavBar from '../../components/BottomNavBar';

const logoUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIcAAAAhCAYAAABa2yJwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADISURBVGhD7dNPCsMgDAbgey918iQ/oA7LqIo22vT8k1I4H7hFF0Ea1D/f6/V6e2gI4W+e3/0/VUJ4AOFJCOFP+TSE8Af8NIQwCH4aQhgm/w0hDEc/DSGcB38NIYzFPw0hDGg/DSH8x34aQjjc/DSGcDv+NIQwfP00hDBs/DSEME7+NIQQD/40hBAP/jSEEA/+NIQQD/40hBAP/jSEEA/+NIQQD/40hBAP/jSEEA/+NIQQD/40hBAf/xV/X4YQ/tV+AQg52s4sLFrrAAAAAElFTkSuQmCC';
    
const HeroSection = () => {
    const navigate = useNavigate();
    const [searchPurpose, setSearchPurpose] = useState<PropertyPurpose>(PropertyPurpose.RENT);
    const [location, setLocation] = useState('');
    const [minPrice, setMinPrice] = useState('0');
    const [maxPrice, setMaxPrice] = useState('2000000');
    const [code, setCode] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        params.append('purpose', searchPurpose);
        if (location) params.append('location', location);
        if (code) params.append('code', code);
        if (minPrice !== '0' || maxPrice !== '2000000') {
            params.append('minPrice', minPrice);
            params.append('maxPrice', maxPrice);
        }
        
        navigate(`/search?${params.toString()}`);
    }
    
    const handlePurposeChange = (purpose: PropertyPurpose) => {
        setSearchPurpose(purpose);
        setMinPrice('0');
        setMaxPrice('2000000');
    }

  return (
    <div className="relative bg-slate-100 overflow-hidden">
      <div className="absolute inset-0">
        <img src="https://picsum.photos/seed/hero/1920/1080" className="w-full h-full object-cover opacity-20" alt="Hero background" />
      </div>
      <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        <div className="text-center">
            <AnimateOnScroll>
                <img src={logoUrl} alt="Rezuski Imóveis Logo" className="h-24 mx-auto mb-6 object-contain" />
            </AnimateOnScroll>
            <AnimateOnScroll delay={50}>
                <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight">
                Dê o próximo passo!
                </h1>
            </AnimateOnScroll>
            <AnimateOnScroll delay={200}>
                <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-600">
                Aqui você está conectado com os melhores imóveis da Região!
                </p>
            </AnimateOnScroll>
        </div>

        <AnimateOnScroll delay={300}>
            <div className="mt-12 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
                <div className="flex border-b border-slate-200">
                    <button
                        onClick={() => handlePurposeChange(PropertyPurpose.RENT)}
                        className={`px-6 py-4 font-semibold text-sm transition-colors w-1/3 rounded-tl-lg ${searchPurpose === PropertyPurpose.RENT ? 'bg-white text-primary-blue' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                        ALUGAR
                    </button>
                    <button
                        onClick={() => handlePurposeChange(PropertyPurpose.SALE)}
                        className={`px-6 py-4 font-semibold text-sm transition-colors w-1/3 border-x border-slate-200 ${searchPurpose === PropertyPurpose.SALE ? 'bg-white text-primary-blue' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                        COMPRAR
                    </button>
                    <button
                        onClick={() => handlePurposeChange(PropertyPurpose.SEASONAL)}
                        className={`px-6 py-4 font-semibold text-sm transition-colors w-1/3 rounded-tr-lg ${searchPurpose === PropertyPurpose.SEASONAL ? 'bg-white text-primary-blue' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                        TEMPORADA
                    </button>
                </div>
                <div className="p-6">
                    <form onSubmit={handleSearch}>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Localização</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <MapPinIcon className="w-5 h-5 text-slate-400" />
                                    </span>
                                    <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Digite uma cidade ou bairro..." className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-primary-blue focus:border-primary-blue" />
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
                                <label className="block text-sm font-medium text-slate-700">Faixa de Preço</label>
                                <div className="mt-2 pt-2">
                                    <div className="flex justify-between items-center text-sm text-slate-600 mb-2">
                                        <span>R$ {Number(minPrice).toLocaleString('pt-BR')}</span>
                                        <span>R$ {Number(maxPrice).toLocaleString('pt-BR')}</span>
                                    </div>
                                    <div className="relative h-5">
                                        <div className="absolute w-full h-1 bg-slate-200 rounded-full top-1/2 -translate-y-1/2"></div>
                                        <div
                                            className="absolute h-1 bg-primary-blue rounded-full top-1/2 -translate-y-1/2"
                                            style={{
                                                left: `${(Number(minPrice) / 2000000) * 100}%`,
                                                right: `${100 - (Number(maxPrice) / 2000000) * 100}%`
                                            }}
                                        ></div>
                                        <div className="absolute w-full h-5 -top-1">
                                            <input
                                                type="range"
                                                min="0"
                                                max="2000000"
                                                step="10000"
                                                value={minPrice}
                                                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                                                    const value = Math.min(Number(e.currentTarget.value), Number(maxPrice) - 10000);
                                                    setMinPrice(String(value));
                                                }}
                                                className="absolute w-full h-1 bg-transparent appearance-none pointer-events-none top-1/2 -translate-y-1/2 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-slate-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-slate-500 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-slate-500 [&::-moz-range-thumb]:cursor-pointer"
                                                style={{ zIndex: 3 }}
                                            />
                                            <input
                                                type="range"
                                                min="0"
                                                max="2000000"
                                                step="10000"
                                                value={maxPrice}
                                                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                                                    const value = Math.max(Number(e.currentTarget.value), Number(minPrice) + 10000);
                                                    setMaxPrice(String(value));
                                                }}
                                                className="absolute w-full h-1 bg-transparent appearance-none pointer-events-none top-1/2 -translate-y-1/2 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-slate-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-slate-500 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-slate-500 [&::-moz-range-thumb]:cursor-pointer"
                                                style={{ zIndex: 4 }}
                                            />
                                        </div>
                                    </div>
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
    const { properties } = useProperties();
    const popular = properties.filter(p => p.isPopular).slice(0, 3);

    return (
        <Section title="Imóveis mais buscados" isGray={true}>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
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
    return (
        <Section title={title} isGray={isGray}>
            <div className="grid gap-8 grid-cols-2 lg:grid-cols-3">
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
        <PropertiesForPurpose title="Imóveis à Venda" purpose={PropertyPurpose.SALE} isGray={true} />
        <PropertiesForPurpose title="Imóveis para Alugar" purpose={PropertyPurpose.RENT} isGray={false} />
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
