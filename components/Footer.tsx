



import React from 'react';
import { Link } from 'react-router-dom';
import { LOGO_URL } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.buy'), path: '/search?purpose=SALE' },
    { name: t('nav.rent'), path: '/search?purpose=RENT' },
    { name: t('nav.seasonal'), path: '/search?purpose=SEASONAL' },
    { name: t('nav.resources'), path: '/resources' },
    { name: t('nav.about'), path: '/about' },
  ];

  const contactInfo = {
    address1: "Rua Romeu Caetano Guida, n0140, salas 02 e 03, Campo do Prado, Cachoeiras de Macacu. RJ - CEP: 28681-320",
    phone: "(021) 96756-7178",
    email: "rezuski.imoveis@gmail.com",
  };

  return (
    <footer className="bg-secondary-blue text-white hidden md:block">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* About */}
          <div className="col-span-1">
            <Link to="/">
                <img src={LOGO_URL} alt="Rezuski Imóveis Logo" className="h-16 object-contain mb-4 filter brightness-0 invert" />
            </Link>
            <p className="text-slate-400 max-w-xs">{t('footer.about')}</p>
          </div>
          
          {/* Navigation */}
          <div>
            <h4 className="font-bold text-slate-200 mb-4 tracking-wider">{t('footer.nav')}</h4>
            <ul className="space-y-3">
              {navLinks.map(link => (
                <li key={link.name}>
                  <Link to={link.path} className="text-slate-400 hover:text-white transition-colors">{link.name}</Link>
                </li>
              ))}
               <li>
                  <Link to="/connection-test" className="text-yellow-400 hover:text-yellow-300 transition-colors">{t('footer.connection_test')}</Link>
                </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
             <h4 className="font-bold text-slate-200 mb-4 tracking-wider">{t('footer.contact')}</h4>
             <ul className="space-y-4 text-slate-400">
                <li className="flex items-start">
                    <p className="leading-relaxed">{contactInfo.address1}</p>
                </li>
                <li className="flex items-start">
                    <p>{contactInfo.phone}</p>
                </li>
                <li className="flex items-start">
                     <p>{contactInfo.email}</p>
                </li>
             </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-700 text-center">
          <p className="text-slate-500 text-sm">&copy; {new Date().getFullYear()} Rezuski Imóveis. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
