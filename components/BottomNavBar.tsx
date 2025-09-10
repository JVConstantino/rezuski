


import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, DollarSignIcon, BuildingIcon, UserCircleIcon } from './Icons';
import { useAuth } from '../contexts/AuthContext';

const BottomNavBar: React.FC = () => {
    const { isAuthenticated, openLoginModal } = useAuth();

    const activeLinkStyle = {
        color: '#2A7ADA',
    };

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-200 shadow-lg z-50">
            <div className="flex justify-around items-center h-16 sm:h-18 px-2 sm:px-4">
                <NavLink 
                    to="/" 
                    end
                    className="flex flex-col items-center justify-center text-slate-600 hover:text-primary-blue transition-colors min-w-0 flex-1 py-2"
                    style={({ isActive }) => isActive ? activeLinkStyle : {}}
                >
                    <HomeIcon className="w-5 h-5 sm:w-6 sm:h-6 mb-1" />
                    <span className="text-[10px] sm:text-xs font-medium leading-tight">Início</span>
                </NavLink>
                <NavLink 
                    to="/search?purpose=SALE" 
                    className="flex flex-col items-center justify-center text-slate-600 hover:text-primary-blue transition-colors min-w-0 flex-1 py-2"
                    style={({ isActive }) => isActive ? activeLinkStyle : {}}
                >
                    <DollarSignIcon className="w-5 h-5 sm:w-6 sm:h-6 mb-1" />
                    <span className="text-[10px] sm:text-xs font-medium leading-tight">Comprar</span>
                </NavLink>
                <NavLink 
                    to="/search?purpose=RENT" 
                    className="flex flex-col items-center justify-center text-slate-600 hover:text-primary-blue transition-colors min-w-0 flex-1 py-2"
                    style={({ isActive }) => isActive ? activeLinkStyle : {}}
                >
                    <BuildingIcon className="w-5 h-5 sm:w-6 sm:h-6 mb-1" />
                    <span className="text-[10px] sm:text-xs font-medium leading-tight">Alugar</span>
                </NavLink>
                 {isAuthenticated ? (
                     <NavLink 
                        to="/admin" 
                        className="flex flex-col items-center justify-center text-slate-600 hover:text-primary-blue transition-colors min-w-0 flex-1 py-2"
                        style={({ isActive }) => isActive ? activeLinkStyle : {}}
                    >
                        <UserCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 mb-1" />
                        <span className="text-[10px] sm:text-xs font-medium leading-tight">Painel</span>
                    </NavLink>
                 ) : (
                    <button 
                        onClick={openLoginModal}
                        className="flex flex-col items-center justify-center text-slate-600 hover:text-primary-blue transition-colors min-w-0 flex-1 py-2"
                    >
                        <UserCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 mb-1" />
                        <span className="text-[10px] sm:text-xs font-medium leading-tight">Entrar</span>
                    </button>
                 )}
            </div>
        </nav>
    );
};

export default BottomNavBar;