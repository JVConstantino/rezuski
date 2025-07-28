
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LOGO_URL } from '../../constants';
import { EyeIcon, EyeOffIcon } from '../../components/Icons';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated, sendPasswordResetEmail } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
        navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotification('');
    try {
        await login(email, password);
    } catch (err: any) {
        if (err.message === 'Invalid login credentials') {
            setError('Email ou senha inválidos. Verifique e tente novamente.');
        } else {
            setError('Ocorreu um erro inesperado. Tente mais tarde.');
        }
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    setNotification('');
    if (!email) {
        setError('Por favor, insira seu email no campo acima para recuperar sua senha.');
        return;
    }
    try {
        await sendPasswordResetEmail(email);
        setNotification('Se o e-mail estiver cadastrado, um link para recuperação de senha foi enviado.');
    } catch (err: any) {
        setError(err.message || 'Ocorreu um erro ao enviar o email de recuperação.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center">
          <img src={LOGO_URL} alt="Rezuski Imóveis Logo" className="h-20 object-contain" />
        </Link>
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
            {notification && (
                <div className="bg-green-50 p-3 rounded-md">
                    <p className="text-sm text-green-700">{notification}</p>
                </div>
            )}
            {error && (
                <div className="bg-red-50 p-3 rounded-md">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}
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
               <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Senha
                </label>
                <div className="text-sm">
                   <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="font-medium text-primary-blue hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
              </div>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"
                   placeholder="••••••••"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500"
                    aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                >
                    {showPassword ? (
                        <EyeOffIcon className="h-5 w-5" />
                    ) : (
                        <EyeIcon className="h-5 w-5" />
                    )}
                </button>
              </div>
            </div>
            
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