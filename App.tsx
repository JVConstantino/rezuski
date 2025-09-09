import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import { PropertyProvider } from './contexts/PropertyContext';
import { BrokerProvider } from './contexts/BrokerContext';
import { CategoryProvider } from './contexts/CategoryContext';
import { ResourceProvider } from './contexts/ResourceContext';
import { ImageProvider } from './contexts/ImageContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AmenityProvider } from './contexts/AmenityContext';
import { UserProvider } from './contexts/UserContext';
import { ApplicationProvider } from './contexts/ApplicationContext';
import { TenantProvider } from './contexts/TenantContext';
import { AIConfigProvider } from './contexts/AIConfigContext';
import { DatabaseConfigProvider, useDatabaseConfig } from './contexts/DatabaseConfigContext';
import { StorageConfigProvider } from './contexts/StorageConfigContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import LoginModalController from './components/LoginModalController';
import ChatWidget from './components/public/ChatWidget';

import HomePage from './pages/public/HomePage';
import SearchResultsPage from './pages/public/SearchResultsPage';
import PropertyDetailsPage from './pages/public/PropertyDetailsPage';
import ResourcesPage from './pages/public/ResourcesPage';
import AboutPage from './pages/public/AboutPage';
import ConnectionTestPage from './pages/public/ConnectionTestPage'; // Import new page

// Lazy load admin pages for better performance
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const PropertiesPage = lazy(() => import('./pages/admin/PropertiesPage'));
const PropertyDetailPage = lazy(() => import('./pages/admin/PropertyDetailPage'));
const AddPropertyPage = lazy(() => import('./pages/admin/AddPropertyPage'));
const EditPropertyPage = lazy(() => import('./pages/admin/EditPropertyPage'));
const ApplicationsPage = lazy(() => import('./pages/admin/ApplicationsPage'));
const ApplicationSummaryPage = lazy(() => import('./pages/admin/ApplicationSummaryPage'));
const TenantsPage = lazy(() => import('./pages/admin/TenantsPage'));
const MessagesPage = lazy(() => import('./pages/admin/MessagesPage'));
const ReportsPage = lazy(() => import('./pages/admin/ReportsPage'));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage'));
const BrokersPage = lazy(() => import('./pages/admin/BrokersPage'));
const AddBrokerPage = lazy(() => import('./pages/admin/AddBrokerPage'));
const EditBrokerPage = lazy(() => import('./pages/admin/EditBrokerPage'));
const CategoriesPage = lazy(() => import('./pages/admin/CategoriesPage'));
const AddCategoryPage = lazy(() => import('./pages/admin/AddCategoryPage'));
const EditCategoryPage = lazy(() => import('./pages/admin/EditCategoryPage'));
const AdminResourcesPage = lazy(() => import('./pages/admin/ResourcesPage'));
const AddResourcePage = lazy(() => import('./pages/admin/AddResourcePage'));
const EditResourcePage = lazy(() => import('./pages/admin/EditResourcePage'));
const GalleryPage = lazy(() => import('./pages/admin/GalleryPage'));
const AmenitiesPage = lazy(() => import('./pages/admin/AmenitiesPage'));
const DataPreviewPage = lazy(() => import('./pages/admin/DataPreviewPage'));
const StorageTestPage = lazy(() => import('./pages/admin/StorageTestPage'));
const DatabaseMigrationPage = lazy(() => import('./pages/admin/DatabaseMigrationPage'));
import DatabaseImageDiagnostic from './components/debug/DatabaseImageDiagnostic';

// Wrapper component to connect database and storage configurations
const StorageWithDatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { activeConfig: activeDatabase } = useDatabaseConfig();
    
    console.log('StorageWithDatabaseProvider: Active database changed:', activeDatabase);
    
    return (
        <StorageConfigProvider activeDatabase={activeDatabase}>
            {children}
        </StorageConfigProvider>
    );
};

const AppContent: React.FC = () => {
    const location = useLocation();
    const isAdminPage = location.pathname.startsWith('/admin');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);
    
    return (
        <DatabaseConfigProvider>
            <LanguageProvider>
                <AuthProvider>
                    <UserProvider>
                        <ApplicationProvider>
                            <TenantProvider>
                                <ResourceProvider>
                                    <CategoryProvider>
                                        <BrokerProvider>
                                            <PropertyProvider>
                                                <AmenityProvider>
                                                    <StorageWithDatabaseProvider>
                                                        <ImageProvider>
                                                            <AIConfigProvider>
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
                                                                        <Route path="/admin" element={
                                                                            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div></div>}>
                                                                                <AdminLayout />
                                                                            </Suspense>
                                                                        }>
                                                                            <Route index element={<Navigate to="/admin/dashboard" replace />} />
                                                                            <Route path="dashboard" element={<Suspense fallback={<div className="p-4">Carregando...</div>}><DashboardPage /></Suspense>} />
                                                                            <Route path="properties" element={<Suspense fallback={<div className="p-4">Carregando...</div>}><PropertiesPage /></Suspense>} />
                                                                            <Route path="properties/new" element={<Suspense fallback={<div className="p-4">Carregando...</div>}><AddPropertyPage /></Suspense>} />
                                                                            <Route path="properties/edit/:propertyId" element={<Suspense fallback={<div className="p-4">Carregando...</div>}><EditPropertyPage /></Suspense>} />
                                                                            <Route path="properties/:propertyId" element={<Suspense fallback={<div className="p-4">Carregando...</div>}><PropertyDetailPage /></Suspense>} />
                                                                            <Route path="brokers" element={<Suspense fallback={<div className="p-4">Carregando...</div>}><BrokersPage /></Suspense>} />
                                                                            <Route path="brokers/new" element={<Suspense fallback={<div className="p-4">Carregando...</div>}><AddBrokerPage /></Suspense>} />
                                                                            <Route path="brokers/edit/:brokerId" element={<Suspense fallback={<div className="p-4">Carregando...</div>}><EditBrokerPage /></Suspense>} />
                                                                            <Route path="categories" element={<Suspense fallback={<div className="p-4">Carregando...</div>}><CategoriesPage /></Suspense>} />
                                                                            <Route path="categories/new" element={<Suspense fallback={<div className="p-4">Carregando...</div>}><AddCategoryPage /></Suspense>} />
                                                                            <Route path="categories/edit/:categoryId" element={<Suspense fallback={<div className="p-4">Carregando...</div>}><EditCategoryPage /></Suspense>} />
                                                                            <Route path="resources" element={<Suspense fallback={<div className="p-4">Carregando...</div>}><AdminResourcesPage /></Suspense>} />
                                                                            <Route path="resources/new" element={<Suspense fallback={<div className="p-4">Carregando...</div>}><AddResourcePage /></Suspense>} />
                                                                            <Route path="resources/edit/:resourceId" element={<Suspense fallback={<div className="p-4">Carregando...</div>}><EditResourcePage /></Suspense>} />
                                                                            <Route path="gallery" element={<Suspense fallback={<div className="p-4">Carregando...</div>}><GalleryPage /></Suspense>} />
                                                                            <Route element={<AdminProtectedRoute />}>
                                                                                <Route path="storage-test" element={<Suspense fallback={<div className="p-4">Carregando...</div>}><StorageTestPage /></Suspense>} />
                                                                                <Route path="data-preview" element={<Suspense fallback={<div className="p-4">Carregando...</div>}><DataPreviewPage /></Suspense>} />
                                                                                <Route path="database-migration" element={<Suspense fallback={<div className="p-4">Carregando...</div>}><DatabaseMigrationPage /></Suspense>} />
                                                                            </Route>
                                                                            <Route path="amenities" element={<Suspense fallback={<div className="p-4">Carregando...</div>}><AmenitiesPage /></Suspense>} />
                                                                            <Route path="messages" element={<Suspense fallback={<div className="p-4">Carregando...</div>}><MessagesPage /></Suspense>} />
                                                                            <Route path="reports" element={<Suspense fallback={<div className="p-4">Carregando...</div>}><ReportsPage /></Suspense>} />
                                                                            <Route path="settings" element={<Suspense fallback={<div className="p-4">Carregando...</div>}><SettingsPage /></Suspense>} />
                                                                        </Route>
                                                                    </Route>

                                                                    {/* Fallback Route */}
                                                                    <Route path="*" element={<Navigate to="/" replace />} />
                                                                </Routes>
                                                                {!isAdminPage && <ChatWidget />}
                                                                <DatabaseImageDiagnostic />
                                                            </AIConfigProvider>
                                                        </ImageProvider>
                                                    </StorageWithDatabaseProvider>
                                                </AmenityProvider>
                                            </PropertyProvider>
                                        </BrokerProvider>
                                    </CategoryProvider>
                                </ResourceProvider>
                            </TenantProvider>
                        </ApplicationProvider>
                    </UserProvider>
                </AuthProvider>
            </LanguageProvider>
        </DatabaseConfigProvider>
    );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;