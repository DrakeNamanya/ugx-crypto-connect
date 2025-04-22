
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { 
  InputOTP, 
  InputOTPGroup, 
  InputOTPSlot 
} from '@/components/ui/input-otp';
import { registerUser } from '@/services/api';

interface VerificationFormProps {
  phone: string;
  onBack: () => void;
  onSuccess: () => void;
  userData: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  };
}

const VerificationForm = ({ phone, onBack, onSuccess, userData }: VerificationFormProps) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isResendingCode, setIsResendingCode] = useState(false);
  const [remainingTime, setRemainingTime] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startResendTimer = () => {
    setRemainingTime(60);
    const timer = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const handleResendCode = () => {
    if (remainingTime > 0) return;
    
    setIsResendingCode(true);
    
    // Simulate API call to resend code
    setTimeout(() => {
      toast.success('New verification code sent to your phone');
      setIsResendingCode(false);
      startResendTimer();
    }, 1000);
  };

  const handleVerification = async () => {
    if (verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit verification code');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Call the API to register the user
      const result = await registerUser(userData);
      
      if (result.success) {
        toast.success('Phone number verified successfully');
        onSuccess();
      } else {
        toast.error(result.message || 'Registration failed');
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium">Verify your phone number</h3>
        <p className="text-sm text-gray-600 mt-1">
          We've sent a 6-digit code to your phone number
        </p>
        <p className="text-sm font-medium mt-2">{phone}</p>
      </div>
      
      <div className="flex flex-col items-center gap-4">
        <div className="w-full">
          <InputOTP 
            maxLength={6}
            value={verificationCode}
            onChange={setVerificationCode}
            render={({ slots }) => (
              <InputOTPGroup className="gap-2 justify-center">
                {slots.map((slot, i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            )}
          />
        </div>
        
        <Button 
          onClick={handleVerification}
          disabled={isSubmitting || verificationCode.length !== 6}
          className="w-full mt-4"
        >
          {isSubmitting ? 'Processing...' : 'Verify and Create Account'}
        </Button>
        
        <div className="flex flex-col items-center gap-2 w-full">
          <p className="text-sm text-gray-500">
            Didn't receive a code?
          </p>
          <Button
            variant="ghost"
            onClick={handleResendCode}
            disabled={remainingTime > 0 || isResendingCode}
            className="text-sm"
          >
            {remainingTime > 0 ? `Resend code (${remainingTime}s)` : 'Resend code'}
          </Button>
          
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-sm"
          >
            Back to registration
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VerificationForm;
