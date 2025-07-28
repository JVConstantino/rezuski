


import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import { PropertyProvider } from './contexts/PropertyContext';
import { BrokerProvider } from './contexts/BrokerContext';
import { CategoryProvider } from './contexts/CategoryContext';
import { ResourceProvider } from './contexts/ResourceContext';
import { ImageProvider } from './contexts/ImageContext';
import { LanguageProvider } from './contexts/LanguageContext';
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
import ApplicationsPage from './pages/admin/ApplicationsPage';
import ApplicationSummaryPage from './pages/admin/ApplicationSummaryPage';
import TenantsPage from './pages/admin/TenantsPage';
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
import GalleryPage from './pages/admin/GalleryPage';

const AppContent: React.FC = () => {
    const location = useLocation();
    const isAdminPage = location.pathname.startsWith('/admin');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);
    
    return (
        <LanguageProvider>
            <AuthProvider>
                <ResourceProvider>
                    <CategoryProvider>
                        <BrokerProvider>
                            <PropertyProvider>
                                <ImageProvider>
                                    <LoginModalController />
                                    <Routes>
                                        {/* Public Routes */}
                                        <Route path="/" element={<HomePage />} />
                                        <Route path="/search" element={<SearchResultsPage />} />
                                        <Route path="/property/:propertyId" element={<PropertyDetailsPage />} />
                                        <Route path="/resources" element={<ResourcesPage />} />
                                        <Route path="/about" element={<AboutPage />} />
                                        <Route path="/connection-test" element={<ConnectionTestPage />} /> {/* Add test route */}

                                        {/* Admin Routes */}
                                        <Route element={<ProtectedRoute />}>
                                            <Route path="/admin" element={<AdminLayout />}>
                                                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                                                <Route path="dashboard" element={<DashboardPage />} />
                                                <Route path="properties" element={<PropertiesPage />} />
                                                <Route path="properties/new" element={<AddPropertyPage />} />
                                                <Route path="properties/edit/:propertyId" element={<EditPropertyPage />} />
                                                <Route path="properties/:propertyId" element={<PropertyDetailPage />} />
                                                <Route path="applications" element={<ApplicationsPage />} />
                                                <Route path="application/:applicationId" element={<ApplicationSummaryPage />} />
                                                <Route path="tenants" element={<TenantsPage />} />
                                                <Route path="brokers" element={<BrokersPage />} />
                                                <Route path="brokers/new" element={<AddBrokerPage />} />
                                                <Route path="brokers/edit/:brokerId" element={<EditBrokerPage />} />
                                                <Route path="categories" element={<CategoriesPage />} />
                                                <Route path="categories/new" element={<AddCategoryPage />} />
                                                <Route path="categories/edit/:categoryId" element={<EditCategoryPage />} />
                                                <Route path="resources" element={<AdminResourcesPage />} />
                                                <Route path="resources/new" element={<AddResourcePage />} />
                                                <Route path="resources/edit/:resourceId" element={<EditResourcePage />} />
                                                <Route path="gallery" element={<GalleryPage />} />
                                                <Route path="messages" element={<MessagesPage />} />
                                                <Route path="reports" element={<ReportsPage />} />
                                                <Route path="settings" element={<SettingsPage />} />
                                            </Route>
                                        </Route>

                                        {/* Fallback Route */}
                                        <Route path="*" element={<Navigate to="/" replace />} />
                                    </Routes>
                                    {!isAdminPage && <ChatWidget />}
                                </ImageProvider>
                            </PropertyProvider>
                        </BrokerProvider>
                    </CategoryProvider>
                </ResourceProvider>
            </AuthProvider>
        </LanguageProvider>
    );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;