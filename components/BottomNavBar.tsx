

import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { HomeIcon, DollarSignIcon, BuildingIcon, UserCircleIcon } from './Icons';
import { useAuth } from '../contexts/AuthContext';

const BottomNavBar: React.FC = () => {
    const { isAuthenticated, openLoginModal } = useAuth();

    const activeLinkStyle = {
        color: '#2A7ADA',
    };

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-t-lg z-50">
            <div className="flex justify-around items-center h-16">
                <ReactRouterDOM.NavLink 
                    to="/" 
                    end
                    className="flex flex-col items-center justify-center text-slate-600 hover:text-primary-blue transition-colors"
                    style={({ isActive }) => isActive ? activeLinkStyle : {}}
                >
                    <HomeIcon className="w-6 h-6" />
                    <span className="text-xs font-medium">Início</span>
                </ReactRouterDOM.NavLink>
                <ReactRouterDOM.NavLink 
                    to="/search?purpose=SALE" 
                    className="flex flex-col items-center justify-center text-slate-600 hover:text-primary-blue transition-colors"
                    style={({ isActive }) => isActive ? activeLinkStyle : {}}
                >
                    <DollarSignIcon className="w-6 h-6" />
                    <span className="text-xs font-medium">Comprar</span>
                </ReactRouterDOM.NavLink>
                <ReactRouterDOM.NavLink 
                    to="/search?purpose=RENT" 
                    className="flex flex-col items-center justify-center text-slate-600 hover:text-primary-blue transition-colors"
                    style={({ isActive }) => isActive ? activeLinkStyle : {}}
                >
                    <BuildingIcon className="w-6 h-6" />
                    <span className="text-xs font-medium">Alugar</span>
                </ReactRouterDOM.NavLink>
                 {isAuthenticated ? (
                     <ReactRouterDOM.NavLink 
                        to="/admin" 
                        className="flex flex-col items-center justify-center text-slate-600 hover:text-primary-blue transition-colors"
                        style={({ isActive }) => isActive ? activeLinkStyle : {}}
                    >
                        <UserCircleIcon className="w-6 h-6" />
                        <span className="text-xs font-medium">Painel</span>
                    </ReactRouterDOM.NavLink>
                 ) : (
                    <button 
                        onClick={openLoginModal}
                        className="flex flex-col items-center justify-center text-slate-600 hover:text-primary-blue transition-colors"
                    >
                        <UserCircleIcon className="w-6 h-6" />
                        <span className="text-xs font-medium">Entrar</span>
                    </button>
                 )}
            </div>
        </nav>
    );
};

export default BottomNavBar;