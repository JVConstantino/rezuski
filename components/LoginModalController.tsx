import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from './LoginModal';

const LoginModalController: React.FC = () => {
    const { isLoginModalOpen, closeLoginModal } = useAuth();

    return <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />;
};

export default LoginModalController;
