
import React, { useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import { PropertyProvider } from './contexts/PropertyContext';
import { BrokerProvider } from './contexts/BrokerContext';
import { CategoryProvider } from './contexts/CategoryContext';
import { ResourceProvider } from './contexts/ResourceContext';
import { ImageProvider } from './contexts/ImageContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginModalController from './components/LoginModalController';
import ChatWidget from './components/public/ChatWidget';

import HomePage from './pages/public/HomePage';
import SearchResultsPage from './pages/public/SearchResultsPage';
import PropertyDetailsPage from './pages/public/PropertyDetailsPage';
import ResourcesPage from './pages/public/ResourcesPage';
import AboutPage from './pages/public/AboutPage';
import ConnectionTestPage from './pages/public/ConnectionTestPage'; // Import new page

import AdminLayout from './pages/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import PropertiesPage from './pages/admin/PropertiesPage';
import PropertyDetailPage from './pages/admin/PropertyDetailPage';
import AddPropertyPage from './pages/admin/AddPropertyPage';
import EditPropertyPage from './pages/admin/EditPropertyPage';
import MessagesPage from './pages/admin/MessagesPage';
import ReportsPage from './pages/admin/ReportsPage';
import SettingsPage from './pages/admin/SettingsPage';
import BrokersPage from './pages/admin/BrokersPage';
import AddBrokerPage from './pages/admin/AddBrokerPage';
import EditBrokerPage from './pages/admin/EditBrokerPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import AddCategoryPage from './pages/admin/AddCategoryPage';
import EditCategoryPage from './pages/admin/EditCategoryPage';
import AdminResourcesPage from './pages/admin/ResourcesPage';
import AddResourcePage from './pages/admin/AddResourcePage';
import EditResourcePage from './pages/admin/EditResourcePage';

const SessionInitializer: React.FC = () => {
    const navigate = ReactRouterDOM.useNavigate();
    const location = ReactRouterDOM.useLocation();

    useEffect(() => {
        const sessionStarted = sessionStorage.getItem('rezuski_session_started');
        if (!sessionStarted) {
            sessionStorage.setItem('rezuski_session_started', 'true');
            if (!location.pathname.startsWith('/admin') && location.pathname !== '/') {
                navigate('/', { replace: true });
            }
        }
    }, []); 

    return null;
};

const AppContent: React.FC = () => {
    const location = ReactRouterDOM.useLocation();
    const isAdminPage = location.pathname.startsWith('/admin');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);
    
    return (
        <AuthProvider>
            <ResourceProvider>
                <CategoryProvider>
                    <BrokerProvider>
                        <PropertyProvider>
                            <ImageProvider>
                                <LoginModalController />
                                <SessionInitializer />
                                <ReactRouterDOM.Routes>
                                    {/* Public Routes */}
                                    <ReactRouterDOM.Route path="/" element={<HomePage />} />
                                    <ReactRouterDOM.Route path="/search" element={<SearchResultsPage />} />
                                    <ReactRouterDOM.Route path="/property/:propertyId" element={<PropertyDetailsPage />} />
                                    <ReactRouterDOM.Route path="/resources" element={<ResourcesPage />} />
                                    <ReactRouterDOM.Route path="/about" element={<AboutPage />} />
                                    <ReactRouterDOM.Route path="/connection-test" element={<ConnectionTestPage />} /> {/* Add test route */}

                                    {/* Admin Routes */}
                                    <ReactRouterDOM.Route element={<ProtectedRoute />}>
                                        <ReactRouterDOM.Route path="/admin" element={<AdminLayout />}>
                                        <ReactRouterDOM.Route index element={<ReactRouterDOM.Navigate to="/admin/dashboard" replace />} />
                                        <ReactRouterDOM.Route path="dashboard" element={<DashboardPage />} />
                                        <ReactRouterDOM.Route path="properties" element={<PropertiesPage />} />
                                        <ReactRouterDOM.Route path="properties/new" element={<AddPropertyPage />} />
                                        <ReactRouterDOM.Route path="properties/edit/:propertyId" element={<EditPropertyPage />} />
                                        <ReactRouterDOM.Route path="properties/:propertyId" element={<PropertyDetailPage />} />
                                        <ReactRouterDOM.Route path="brokers" element={<BrokersPage />} />
                                        <ReactRouterDOM.Route path="brokers/new" element={<AddBrokerPage />} />
                                        <ReactRouterDOM.Route path="brokers/edit/:brokerId" element={<EditBrokerPage />} />
                                        <ReactRouterDOM.Route path="categories" element={<CategoriesPage />} />
                                        <ReactRouterDOM.Route path="categories/new" element={<AddCategoryPage />} />
                                        <ReactRouterDOM.Route path="categories/edit/:categoryId" element={<EditCategoryPage />} />
                                        <ReactRouterDOM.Route path="resources" element={<AdminResourcesPage />} />
                                        <ReactRouterDOM.Route path="resources/new" element={<AddResourcePage />} />
                                        <ReactRouterDOM.Route path="resources/edit/:resourceId" element={<EditResourcePage />} />
                                        <ReactRouterDOM.Route path="messages" element={<MessagesPage />} />
                                        <ReactRouterDOM.Route path="reports" element={<ReportsPage />} />
                                        <ReactRouterDOM.Route path="settings" element={<SettingsPage />} />
                                        </ReactRouterDOM.Route>
                                    </ReactRouterDOM.Route>

                                    {/* Fallback Route */}
                                    <ReactRouterDOM.Route path="*" element={<ReactRouterDOM.Navigate to="/" replace />} />
                                </ReactRouterDOM.Routes>
                                {!isAdminPage && <ChatWidget />}
                            </ImageProvider>
                        </PropertyProvider>
                    </BrokerProvider>
                </CategoryProvider>
            </ResourceProvider>
        </AuthProvider>
    );
};

const App: React.FC = () => {
  return (
    <ReactRouterDOM.HashRouter>
      <AppContent />
    </ReactRouterDOM.HashRouter>
  );
};

export default App;
