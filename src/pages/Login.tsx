
import React from 'react';
import { Helmet } from 'react-helmet-async';
import LoginForm from '@/components/auth/LoginForm';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SEO 
        title="Login | UGXchange" 
        description="Sign in to your UGXchange account to access crypto trading, mobile money integration, and more."
        keywords="login, signin, crypto exchange, UGXchange, Uganda"
      />
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-2">Welcome Back</h1>
          <p className="text-gray-600 text-center mb-8">
            Access your UGXchange account
          </p>
          <LoginForm />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
