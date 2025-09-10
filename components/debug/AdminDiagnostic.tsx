import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from 'react-router-dom';

interface DiagnosticInfo {
  timestamp: string;
  isAuthenticated: boolean;
  user: any;
  location: string;
  renderCount: number;
}

const AdminDiagnostic: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [diagnostics, setDiagnostics] = useState<DiagnosticInfo[]>([]);
  const [renderCount, setRenderCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setRenderCount(prev => {
      const newCount = prev + 1;
      
      const newDiagnostic: DiagnosticInfo = {
        timestamp: new Date().toLocaleTimeString(),
        isAuthenticated,
        user: user ? { id: user.id, email: user.email, role: user.role } : null,
        location: location.pathname,
        renderCount: newCount
      };

      setDiagnostics(prevDiagnostics => {
        const updated = [newDiagnostic, ...prevDiagnostics].slice(0, 10); // Keep last 10 entries
        return updated;
      });

      // Log to console for debugging
      if (location.pathname.startsWith('/admin')) {
        console.log('🔍 Admin Diagnostic:', newDiagnostic);
      }
      
      return newCount;
    });
  }, [isAuthenticated, user, location.pathname]);

  // Only show on admin pages
  if (!location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 left-4 z-50 bg-purple-600 text-white p-2 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
        title="Admin Diagnostic"
      >
        🔍
      </button>

      {/* Diagnostic Panel */}
      {isVisible && (
        <div className="fixed bottom-16 left-4 z-50 bg-white border border-gray-300 rounded-lg shadow-xl p-4 max-w-md max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-800">Admin Diagnostic</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Current Status */}
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <h4 className="font-semibold text-sm mb-2">Status Atual:</h4>
            <div className="text-xs space-y-1">
              <div className={`flex items-center gap-2`}>
                <span className={`w-2 h-2 rounded-full ${isAuthenticated ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span>Autenticado: {isAuthenticated ? 'Sim' : 'Não'}</span>
              </div>
              <div>Usuário: {user?.email || 'N/A'}</div>
              <div>Role: {user?.role || 'N/A'}</div>
              <div>Página: {location.pathname}</div>
              <div>Renders: {renderCount}</div>
            </div>
          </div>

          {/* Diagnostic History */}
          <div>
            <h4 className="font-semibold text-sm mb-2">Histórico (últimos 10):</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {diagnostics.map((diag, index) => (
                <div key={index} className="text-xs p-2 bg-gray-50 rounded border-l-2 border-purple-300">
                  <div className="font-mono text-gray-600">{diag.timestamp}</div>
                  <div className={`${diag.isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                    Auth: {diag.isAuthenticated ? '✓' : '✗'}
                  </div>
                  <div>User: {diag.user?.email || 'None'}</div>
                  <div>Page: {diag.location}</div>
                  <div>Render: #{diag.renderCount}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
              >
                Reload
              </button>
              <button
                onClick={() => setDiagnostics([])}
                className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
              >
                Clear
              </button>
              <button
                onClick={() => console.log('Admin Diagnostics:', diagnostics)}
                className="text-xs bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600"
              >
                Log
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDiagnostic;