
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RegistrationForm from '@/components/RegistrationForm';

const Register = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    toast.success("Account created successfully!");
    
    // Initialize KYC status in local storage
    localStorage.setItem('userCreationDate', new Date().toISOString());
    localStorage.setItem('kycStatus', JSON.stringify({
      isVerified: false,
      submittedAt: null,
      expiryDate: null,
      reminderCount: 0
    }));

    // Show KYC prompt
    toast.info(
      "Verify your identity to unlock full functionality",
      {
        description: "Complete KYC verification to access higher transaction limits",
        action: {
          label: "Verify Now",
          onClick: () => navigate('/kyc-verification'),
        },
        duration: 8000,
      }
    );

    // Navigate to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-6">Create an Account</h1>
          <p className="text-gray-600 text-center mb-8">
            Join UGXchange, the leading crypto exchange platform in Uganda.
          </p>
          <RegistrationForm onSuccess={handleSuccess} />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Register;
