
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    if (!isOpen) {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            // On success, the AuthContext will handle navigation
        } catch (err: any) {
            setError(err.message || 'Falha no login.');
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center transition-opacity duration-300" 
            onClick={onClose}
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
                        <label htmlFor="modal-password" className="block text-sm font-medium text-slate-700">
                            Senha
                        </label>
                        <div className="mt-1">
                            <input
                                id="modal-password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    
                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}

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
