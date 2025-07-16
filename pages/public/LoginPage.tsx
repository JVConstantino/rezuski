
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();
  const navigate = ReactRouterDOM.useNavigate();
  const logoUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIcAAAAhCAYAAABa2yJwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADISURBVGhD7dNPCsMgDAbgey918iQ/oA7LqIo22vT8k1I4H7hFF0Ea1D/f6/V6e2gI4W+e3/0/VUJ4AOFJCOFP+TSE8Af8NIQwCH4aQhgm/w0hDEc/DSGcB38NIYzFPw0hDGg/DSH8x34aQjjc/DSGcDv+NIQwfP00hDBs/DSEME7+NIQQD/40hBAP/jSEEA/+NIQQD/40hBAP/jSEEA/+NIQQD/40hBAP/jSEEA/+NIQQD/40hBAf/xV/X4YQ/tV+AQg52s4sLFrrAAAAAElFTkSuQmCC';

  useEffect(() => {
    if (isAuthenticated) {
        navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Mock authentication. In a real app, this would be an API call.
    if (email === 'admin@rezuski.com' && password === 'admin') {
         login(email);
    } else {
        setError('Credenciais inválidas. Tente "admin@rezuski.com" com a senha "admin".');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <ReactRouterDOM.Link to="/" className="flex justify-center">
          <img src={logoUrl} alt="Rezuski Imóveis Logo" className="h-20 object-contain" />
        </ReactRouterDOM.Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Acesse o painel
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Exclusivo para administradores
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"
                  placeholder="admin@rezuski.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Senha
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"
                   placeholder="admin"
                />
              </div>
            </div>
            
            {error && <p className="text-sm text-red-600">{error}</p>}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-blue hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue"
              >
                Entrar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;