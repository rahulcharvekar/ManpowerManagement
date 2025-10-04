import React, { useState } from 'react';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import ForgotPasswordPage from './ForgotPasswordPage';

const AuthContainer = ({ onAuthSuccess }) => {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'register', 'forgot'

  const handleLogin = (userData) => {
    // Handle successful login
    console.log('Login successful:', userData);
    onAuthSuccess(userData);
  };

  const handleRegister = (userData) => {
    // Handle successful registration
    console.log('Registration successful:', userData);
    // You might want to automatically log them in or redirect to login
    setCurrentView('login');
    // Or automatically sign them in:
    // onAuthSuccess(userData);
  };

  const handleForgotPasswordSuccess = () => {
    // Handle successful password reset
    setCurrentView('login');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'login':
        return (
          <LoginPage
            onLogin={handleLogin}
            onSwitchToRegister={() => setCurrentView('register')}
            onSwitchToForgotPassword={() => setCurrentView('forgot')}
          />
        );
      case 'register':
        return (
          <RegisterPage
            onRegister={handleRegister}
            onSwitchToLogin={() => setCurrentView('login')}
          />
        );
      case 'forgot':
        return (
          <ForgotPasswordPage
            onBackToLogin={() => setCurrentView('login')}
            onResetSuccess={handleForgotPasswordSuccess}
          />
        );
      default:
        return (
          <LoginPage
            onLogin={handleLogin}
            onSwitchToRegister={() => setCurrentView('register')}
            onSwitchToForgotPassword={() => setCurrentView('forgot')}
          />
        );
    }
  };

  return renderCurrentView();
};

export default AuthContainer;
