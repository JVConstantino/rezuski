import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import BottomNavBar from '../../components/BottomNavBar';
import AnimateOnScroll from '../../components/AnimateOnScroll';
import { MapPinIcon, PhoneIcon, MailIcon } from '../../components/Icons';

const AboutPage: React.FC = () => {
    const address1 = "Rua Romeu Caetano Guida, n0140, salas 02 e 03, Campo do Prado, Cachoeiras de Macacu. RJ - CEP: 28681-320";
    const address2 = "Rua Osvaldir Vicente Siqueira, n° 134, Centro, Papucaia - Cachoeiras de Macacu - RJ";
    const phone = "(021) 96756-7178";
    const email = "rezuski.imoveis@gmail.com";

    const mapQuery = encodeURIComponent(address1);
    
    return (
        <div className="bg-white min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
                {/* Hero Section */}
                <div className="bg-slate-100">
                    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                        <AnimateOnScroll>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900">Sobre a Rezuski Imóveis</h1>
                            <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600">
                                Conectando pessoas e propriedades com confiança e expertise.
                            </p>
                        </AnimateOnScroll>
                    </div>
                </div>

                {/* About Us Content */}
                <div className="py-24">
                    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                            <AnimateOnScroll>
                                <img 
                                    src="https://picsum.photos/seed/aboutus/600/400" 
                                    alt="Equipe da Rezuski Imóveis" 
                                    className="rounded-lg shadow-lg object-cover"
                                />
                            </AnimateOnScroll>
                            <AnimateOnScroll delay={100}>
                                <h2 className="text-3xl font-bold text-slate-800">Nossa História</h2>
                                <p className="mt-4 text-slate-600 leading-relaxed">
                                    Fundada com a missão de transformar o mercado imobiliário da região, a Rezuski Imóveis se destaca pelo atendimento personalizado e pela profunda conoscenza do mercado local. Nosso compromisso é com a transparência, a ética e a satisfação total de nossos clientes.
                                </p>
                                <p className="mt-4 text-slate-600 leading-relaxed">
                                    Seja para comprar, vender ou alugar, nossa equipe de especialistas está pronta para oferecer a melhor assessoria, garantindo segurança e tranquilidade em cada etapa da negociação. Na Rezuski, não negociamos apenas imóveis, realizamos sonhos.
                                </p>
                            </AnimateOnScroll>
                        </div>
                    </div>
                </div>

                {/* Offices and Contact Section */}
                 <div className="bg-slate-50 py-24">
                    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                        <AnimateOnScroll>
                           <div className="text-center mb-16">
                                <h2 className="text-3xl font-extrabold text-slate-900">Nossos Escritórios</h2>
                                <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600">Visite-nos ou entre em contato. Estamos sempre prontos para atendê-lo.</p>
                            </div>
                        </AnimateOnScroll>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                             <AnimateOnScroll delay={100}>
                                <div className="space-y-8">
                                    {/* Office 1 */}
                                    <div className="bg-white p-6 rounded-lg shadow-md">
                                        <h3 className="font-bold text-xl text-primary-blue mb-3">Escritório Principal</h3>
                                        <div className="flex items-start space-x-3">
                                            <MapPinIcon className="w-6 h-6 text-slate-500 mt-1 flex-shrink-0" />
                                            <p className="text-slate-700">{address1}</p>
                                        </div>
                                    </div>
                                    {/* Office 2 */}
                                     <div className="bg-white p-6 rounded-lg shadow-md">
                                        <h3 className="font-bold text-xl text-primary-blue mb-3">Filial Papucaia</h3>
                                        <div className="flex items-start space-x-3">
                                            <MapPinIcon className="w-6 h-6 text-slate-500 mt-1 flex-shrink-0" />
                                            <p className="text-slate-700">{address2}</p>
                                        </div>
                                    </div>
                                     {/* Contact Info */}
                                     <div className="bg-white p-6 rounded-lg shadow-md">
                                        <h3 className="font-bold text-xl text-primary-blue mb-3">Contato Direto</h3>
                                         <div className="space-y-3">
                                            <div className="flex items-center space-x-3">
                                                <PhoneIcon className="w-5 h-5 text-slate-500 flex-shrink-0" />
                                                <a href={`tel:${phone.replace(/\D/g, '')}`} className="text-slate-700 hover:text-primary-blue">{phone}</a>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <MailIcon className="w-5 h-5 text-slate-500 flex-shrink-0" />
                                                <a href={`mailto:${email}`} className="text-slate-700 hover:text-primary-blue">{email}</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </AnimateOnScroll>
                             <AnimateOnScroll delay={200}>
                                <div className="aspect-w-4 aspect-h-3">
                                     <iframe 
                                        src={`https://www.google.com/maps/embed/v1/place?q=${mapQuery}`}
                                        width="100%" 
                                        height="100%" 
                                        style={{ border: 0 }} 
                                        allowFullScreen={true} 
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        className="w-full h-full min-h-[500px] rounded-lg shadow-lg"
                                        title="Localização do Escritório Principal"
                                    ></iframe>
                                </div>
                            </AnimateOnScroll>
                        </div>
                    </div>
                </div>

            </main>
            <Footer />
            <BottomNavBar />
        </div>
    );
};

export default AboutPage;
