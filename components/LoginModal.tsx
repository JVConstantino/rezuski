
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { EyeIcon, EyeOffIcon } from './Icons';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [notification, setNotification] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, sendPasswordResetEmail } = useAuth();

    if (!isOpen) {
        return null;
    }
    
    const handleClose = () => {
        setError('');
        setNotification('');
        setEmail('');
        setPassword('');
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setNotification('');
        try {
            await login(email, password);
            // On success, the AuthContext will handle navigation and close the modal
        } catch (err: any) {
            if (err.message === 'Invalid login credentials') {
                setError('Email ou senha inválidos.');
            } else {
                setError('Ocorreu um erro. Tente novamente.');
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
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center transition-opacity duration-300" 
            onClick={handleClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md" 
                onClick={e => e.stopPropagation()}
            >
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900">Acesse o painel</h2>
                    <p className="mt-2 text-sm text-slate-600">Exclusivo para administradores</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
                        <label htmlFor="modal-email" className="block text-sm font-medium text-slate-700">
                            Email
                        </label>
                        <div className="mt-1">
                            <input
                                id="modal-email"
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
                        <div className="flex justify-between items-center">
                            <label htmlFor="modal-password" className="block text-sm font-medium text-slate-700">
                                Senha
                            </label>
                             <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="text-sm font-medium text-primary-blue hover:underline focus:outline-none"
                            >
                                Esqueceu a senha?
                            </button>
                        </div>
                        <div className="mt-1 relative">
                            <input
                                id="modal-password"
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
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-green hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green"
                        >
                            Entrar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;
