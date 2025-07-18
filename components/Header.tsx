


import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LOGO_URL } from '../constants';

const Header: React.FC = () => {
  const { isAuthenticated, logout, openLoginModal } = useAuth();
  
  const navLinksConfig = [
    { name: 'Início', path: '/' },
    { name: 'Comprar', path: '/search?purpose=SALE' },
    { name: 'Alugar', path: '/search?purpose=RENT' },
    { name: 'Temporada', path: '/search?purpose=SEASONAL' },
    { name: 'Recursos', path: '/resources' },
    { name: 'Sobre', path: '/about' },
  ];

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 w-full border-b border-slate-200">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img src={LOGO_URL} alt="Rezuski Imóveis Logo" className="h-16 object-contain" />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinksConfig.map(link => (
              <Link key={link.name} to={link.path} className="text-slate-600 hover:text-primary-blue font-medium transition-colors">
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
             {isAuthenticated ? (
                <>
                    <Link
                        to="/admin/dashboard"
                        className="hidden md:inline-flex items-center px-4 py-2 bg-secondary-blue text-white font-semibold rounded-lg shadow-md hover:opacity-95 transition-all duration-200"
                    >
                        Voltar ao Painel
                    </Link>
                    <button
                        onClick={logout}
                        className="hidden md:inline-flex px-4 py-2 bg-primary-green text-white font-semibold rounded-lg shadow-md hover:opacity-95 transition-all duration-200"
                    >
                        Sair
                    </button>
                </>
            ) : (
                <button
                  onClick={openLoginModal}
                  className="hidden md:inline-flex px-4 py-2 bg-primary-green text-white font-semibold rounded-lg shadow-md hover:opacity-95 transition-all duration-200"
                >
                  Entrar
                </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;