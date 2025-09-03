import React, { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { 
    LayoutGridIcon, HomeIcon, FileTextIcon, UsersIcon, MessageSquareIcon, 
    BarChartIcon, SettingsIcon, BellIcon, SearchIcon, LogOutIcon, MenuIcon, XIcon, EyeIcon, FolderIcon, HouseUserIcon, CheckCircleIcon
} from '../../components/Icons';
import { useAuth } from '../../contexts/AuthContext';
import { LOGO_URL } from '../../constants';

const Sidebar: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    const { user } = useAuth();

    const allNavLinks = [
        { name: "Painel", path: "/admin/dashboard", icon: <LayoutGridIcon className="w-5 h-5"/> },
        { name: "Propriedades", path: "/admin/properties", icon: <HomeIcon className="w-5 h-5"/> },
        { name: "Aplicações", path: "/admin/applications", icon: <FileTextIcon className="w-5 h-5"/> },
        { name: "Inquilinos", path: "/admin/tenants", icon: <HouseUserIcon className="w-5 h-5"/> },
        { name: "Corretores", path: "/admin/brokers", icon: <UsersIcon className="w-5 h-5"/> },
        { name: "Categorias", path: "/admin/categories", icon: <LayoutGridIcon className="w-5 h-5"/> },
        { name: "Recursos", path: "/admin/resources", icon: <FileTextIcon className="w-5 h-5"/> },
        { name: "Comodidades", path: "/admin/amenities", icon: <CheckCircleIcon className="w-5 h-5"/> },
        { name: "Galeria", path: "/admin/gallery", icon: <FolderIcon className="w-5 h-5"/> },
        { name: "Teste Storage", path: "/admin/storage-test", icon: <SettingsIcon className="w-5 h-5"/> },
        { name: "Mensagens", path: "/admin/messages", icon: <MessageSquareIcon className="w-5 h-5"/> },
        { name: "Relatórios", path: "/admin/reports", icon: <BarChartIcon className="w-5 h-5"/> },
        { name: "Pré-visualização de Dados", path: "/admin/data-preview", icon: <FileTextIcon className="w-5 h-5"/> },
    ];
    
    const navLinks = allNavLinks.filter(link => {
        if (link.name === 'Aplicações' || link.name === 'Inquilinos') {
            return false;
        }
        if (link.name === 'Pré-visualização de Dados') {
            return user?.email === 'joaovictor.priv@gmail.com';
        }
        return true;
    });
    
    return (
        <>
            {/* Overlay */}
            <div 
                className={`fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}
                aria-hidden="true"
            ></div>
            
            <aside 
                role="dialog"
                aria-modal="true"
                aria-label="Main navigation"
                className={`fixed top-0 left-0 h-full w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col z-50
                transform transition-transform duration-300 ease-in-out md:static md:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="h-20 flex items-center justify-between px-6 border-b border-slate-200">
                     <Link to="/" className="flex-shrink-0">
                        <img src={LOGO_URL} alt="Rezuski Imóveis Logo" className="h-16 object-contain" />
                    </Link>
                    <button onClick={onClose} className="md:hidden text-slate-500 hover:text-primary-blue" aria-label="Close menu">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navLinks.map(link => (
                        <NavLink
                            key={link.name}
                            to={link.path}
                            onClick={onClose} // Close sidebar on mobile navigation
                            className={({ isActive }) => 
                                `flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors duration-200 ${
                                    isActive ? 'bg-primary-blue/10 text-primary-blue font-semibold' : 'text-slate-600 hover:bg-slate-100'
                                }`
                            }
                        >
                            {link.icon}
                            <span>{link.name}</span>
                        </NavLink>
                    ))}
                </nav>
                <div className="px-4 py-6 border-t border-slate-200">
                     <NavLink
                        to="/admin/settings"
                        onClick={onClose}
                        className={({ isActive }) => 
                            `flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors duration-200 ${
                                isActive ? 'bg-primary-blue/10 text-primary-blue font-semibold' : 'text-slate-600 hover:bg-slate-100'
                            }`
                        }
                    >
                        <SettingsIcon className="w-5 h-5"/>
                        <span>Configurações</span>
                    </NavLink>
                </div>
            </aside>
        </>
    )
}

const AdminHeader: React.FC<{ onMenuToggle: () => void }> = ({ onMenuToggle }) => {
    const { user, logout } = useAuth();
    return (
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6">
            <div className="flex items-center">
                <button onClick={onMenuToggle} className="md:hidden text-slate-500 hover:text-primary-blue mr-4" aria-label="Open menu">
                    <MenuIcon className="w-6 h-6" />
                </button>
                <div className="relative hidden md:block">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <SearchIcon className="w-5 h-5 text-slate-400" />
                    </span>
                    <input type="text" placeholder="Buscar..." className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-primary-blue focus:border-primary-blue"/>
                </div>
            </div>
            <div className="flex items-center space-x-4 md:space-x-6">
                 <Link 
                    to="/"
                    className="flex items-center bg-white border border-slate-300 text-slate-700 font-semibold py-2 px-3 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
                    title="Ver site"
                >
                    <EyeIcon className="w-5 h-5 md:mr-2" />
                    <span className="hidden md:inline">Ver Site</span>
                </Link>
                <button className="text-slate-500 hover:text-primary-blue relative" aria-label="Notifications">
                    <BellIcon className="w-6 h-6"/>
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <div className="flex items-center space-x-3">
                    <img src={user?.avatarUrl} alt={user?.name} className="w-10 h-10 rounded-full"/>
                    <div className="hidden md:block">
                        <div className="font-semibold text-slate-800">{user?.name}</div>
                        <div className="text-sm text-slate-500">{user?.email}</div>
                    </div>
                </div>
                 <button onClick={logout} title="Sair" className="text-slate-500 hover:text-primary-blue" aria-label="Log out">
                    <LogOutIcon className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
}

const AdminLayout: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)}/>
            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminHeader onMenuToggle={() => setSidebarOpen(true)}/>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6 md:p-8">
                    <Outlet/>
                </main>
            </div>
        </div>
    )
}

export default AdminLayout;