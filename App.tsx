import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAutoReload } from './hooks/useAutoReload';

// Service Worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`)
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

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
import CookieConsent from './components/CookieConsent';
import HotReloadIndicator from './components/HotReloadIndicator';
import Preloader from './components/Preloader';

import HomePage from './pages/public/HomePage';
import SearchResultsPage from './pages/public/SearchResultsPage';
import SalesPage from './pages/public/SalesPage';
import RentPage from './pages/public/RentPage';
import SeasonalPage from './pages/public/SeasonalPage';
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
// import AdminDiagnostic from './components/debug/AdminDiagnostic'; // Temporarily disabled due to infinite loop
import ErrorBoundary from './components/ErrorBoundary';

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
                                                                    <Route path="/vendas" element={<SalesPage />} />
                                                                    <Route path="/alugueis" element={<RentPage />} />
                                                                    <Route path="/temporada" element={<SeasonalPage />} />
                                                                    <Route path="/search" element={<SearchResultsPage />} />
                                                                    <Route path="/property/:propertyId" element={<PropertyDetailsPage />} />
                                                                    <Route path="/resources" element={<ResourcesPage />} />
                                                                    <Route path="/about" element={<AboutPage />} />
                                                                    <Route path="/connection-test" element={<ConnectionTestPage />} /> {/* Add test route */}

                                                                    {/* Admin Routes */}
                                                                    <Route element={<ProtectedRoute />}>
                                                                        <Route path="/admin" element={
                                                                            <ErrorBoundary>
                                                                                <Suspense fallback={<Preloader isLoading={true} message="Carregando painel administrativo..." />}>
                                                                                    <AdminLayout />
                                                                                </Suspense>
                                                                            </ErrorBoundary>
                                                                        }>
                                                                            <Route index element={<Navigate to="/admin/dashboard" replace />} />
                                                                            <Route path="dashboard" element={<Suspense fallback={<Preloader isLoading={true} message="Carregando dashboard..." />}><DashboardPage /></Suspense>} />
                                                                            <Route path="properties" element={<Suspense fallback={<Preloader isLoading={true} message="Carregando propriedades..." />}><PropertiesPage /></Suspense>} />
                                                                            <Route path="properties/new" element={<Suspense fallback={<Preloader isLoading={true} message="Carregando formulário..." />}><AddPropertyPage /></Suspense>} />
                                                                            <Route path="properties/edit/:propertyId" element={<Suspense fallback={<Preloader isLoading={true} message="Carregando editor..." />}><EditPropertyPage /></Suspense>} />
                                                                            <Route path="properties/:propertyId" element={<Suspense fallback={<Preloader isLoading={true} message="Carregando detalhes..." />}><PropertyDetailPage /></Suspense>} />
                                                                            <Route path="brokers" element={<Suspense fallback={<Preloader isLoading={true} message="Carregando corretores..." />}><BrokersPage /></Suspense>} />
                                                                            <Route path="brokers/new" element={<Suspense fallback={<Preloader isLoading={true} message="Carregando formulário..." />}><AddBrokerPage /></Suspense>} />
                                                                            <Route path="brokers/edit/:brokerId" element={<Suspense fallback={<Preloader isLoading={true} message="Carregando editor..." />}><EditBrokerPage /></Suspense>} />
                                                                            <Route path="categories" element={<Suspense fallback={<Preloader isLoading={true} message="Carregando categorias..." />}><CategoriesPage /></Suspense>} />
                                                                            <Route path="categories/new" element={<Suspense fallback={<Preloader isLoading={true} message="Carregando formulário..." />}><AddCategoryPage /></Suspense>} />
                                                                            <Route path="categories/edit/:categoryId" element={<Suspense fallback={<Preloader isLoading={true} message="Carregando editor..." />}><EditCategoryPage /></Suspense>} />
                                                                            <Route path="resources" element={<Suspense fallback={<Preloader isLoading={true} message="Carregando recursos..." />}><AdminResourcesPage /></Suspense>} />
                                                                            <Route path="resources/new" element={<Suspense fallback={<Preloader isLoading={true} message="Carregando formulário..." />}><AddResourcePage /></Suspense>} />
                                                                            <Route path="resources/edit/:resourceId" element={<Suspense fallback={<Preloader isLoading={true} message="Carregando editor..." />}><EditResourcePage /></Suspense>} />
                                                                            <Route path="gallery" element={<Suspense fallback={<Preloader isLoading={true} message="Carregando galeria..." />}><GalleryPage /></Suspense>} />
                                                                            <Route element={<AdminProtectedRoute />}>
                                                                                <Route path="storage-test" element={<Suspense fallback={<Preloader isLoading={true} message="Carregando teste..." />}><StorageTestPage /></Suspense>} />
                                                                                <Route path="data-preview" element={<Suspense fallback={<Preloader isLoading={true} message="Carregando dados..." />}><DataPreviewPage /></Suspense>} />
                                                                                <Route path="database-migration" element={<Suspense fallback={<Preloader isLoading={true} message="Carregando migração..." />}><DatabaseMigrationPage /></Suspense>} />
                                                                            </Route>
                                                                            <Route path="amenities" element={<Suspense fallback={<Preloader isLoading={true} message="Carregando comodidades..." />}><AmenitiesPage /></Suspense>} />
                                                                            <Route path="messages" element={<Suspense fallback={<Preloader isLoading={true} message="Carregando mensagens..." />}><MessagesPage /></Suspense>} />
                                                                            <Route path="reports" element={<Suspense fallback={<Preloader isLoading={true} message="Carregando relatórios..." />}><ReportsPage /></Suspense>} />
                                                                            <Route path="settings" element={<Suspense fallback={<Preloader isLoading={true} message="Carregando configurações..." />}><SettingsPage /></Suspense>} />
                                                                        </Route>
                                                                    </Route>

                                                                    {/* Fallback Route */}
                                                                    <Route path="*" element={<Navigate to="/" replace />} />
                                                                </Routes>
                                                                {!isAdminPage && <ChatWidget />}
                                                                <CookieConsent />
                                                                 <HotReloadIndicator />
                                                                 <DatabaseImageDiagnostic />
                                                                 {/* <AdminDiagnostic /> */} {/* Temporarily disabled due to infinite loop */}
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
  // Ativa o sistema de auto-reload
  const { forceReload, isHMRActive } = useAutoReload({
    enabled: true,
    interval: 2000, // Verifica a cada 2 segundos
    onReload: () => {
      console.log('🔄 Sistema detectou mudanças, recarregando...');
    }
  });

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;