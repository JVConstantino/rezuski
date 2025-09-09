import { useAuth } from '../contexts/AuthContext';

export const useUserPermissions = () => {
    const { user } = useAuth();
    
    const isSuperAdmin = () => {
        return user?.email === 'joaovictor.priv@gmail.com';
    };
    
    const canAccessAdvancedTools = () => {
        return isSuperAdmin();
    };
    
    const canAccessStorageConfig = () => {
        return isSuperAdmin();
    };
    
    const canAccessDatabaseConfig = () => {
        return isSuperAdmin();
    };
    
    return {
        user,
        isSuperAdmin,
        canAccessAdvancedTools,
        canAccessStorageConfig,
        canAccessDatabaseConfig
    };
};