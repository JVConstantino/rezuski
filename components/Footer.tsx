

import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';

const Footer: React.FC = () => {
  const logoUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIcAAAAhCAYAAABa2yJwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADISURBVGhD7dNPCsMgDAbgey918iQ/oA7LqIo22vT8k1I4H7hFF0Ea1D/f6/V6e2gI4W+e3/0/VUJ4AOFJCOFP+TSE8Af8NIQwCH4aQhgm/w0hDEc/DSGcB38NIYzFPw0hDGg/DSH8x34aQjjc/DSGcDv+NIQwfP00hDBs/DSEME7+NIQQD/40hBAP/jSEEA/+NIQQD/40hBAP/jSEEA/+NIQQD/40hBAP/jSEEA/+NIQQD/40hBAf/xV/X4YQ/tV+AQg52s4sLFrrAAAAAElFTkSuQmCC';
  
  const navLinks = [
    { name: 'Início', path: '/' },
    { name: 'Comprar', path: '/search?purpose=SALE' },
    { name: 'Alugar', path: '/search?purpose=RENT' },
    { name: 'Temporada', path: '/search?purpose=SEASONAL' },
    { name: 'Recursos', path: '/resources' },
    { name: 'Sobre', path: '/about' },
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
            <ReactRouterDOM.Link to="/">
                <img src={logoUrl} alt="Rezuski Imóveis Logo" className="h-16 object-contain mb-4 filter brightness-0 invert" />
            </ReactRouterDOM.Link>
            <p className="text-slate-400 max-w-xs">Uma nova forma de encontrar o seu lar. Facilitamos para inquilinos e proprietários.</p>
          </div>
          
          {/* Navigation */}
          <div>
            <h4 className="font-bold text-slate-200 mb-4 tracking-wider">NAVEGAÇÃO</h4>
            <ul className="space-y-3">
              {navLinks.map(link => (
                <li key={link.name}>
                  <ReactRouterDOM.Link to={link.path} className="text-slate-400 hover:text-white transition-colors">{link.name}</ReactRouterDOM.Link>
                </li>
              ))}
               <li>
                  <ReactRouterDOM.Link to="/connection-test" className="text-yellow-400 hover:text-yellow-300 transition-colors">Testar Conexão</ReactRouterDOM.Link>
                </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
             <h4 className="font-bold text-slate-200 mb-4 tracking-wider">CONTATO</h4>
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