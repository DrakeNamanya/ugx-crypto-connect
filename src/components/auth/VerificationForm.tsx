import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from '@/components/ui/input-otp';
import { registerUser } from '@/services/api';
import { sendOTP } from '@/services/api';

// Make sure this interface matches what's being passed from RegistrationForm
export interface UserData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

interface VerificationFormProps {
  phone: string;
  onBack: () => void;
  onSuccess: () => void;
  userData: UserData;
}

const VerificationForm: React.FC<VerificationFormProps> = ({ phone, onBack, onSuccess, userData }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResendingCode, setIsResendingCode] = useState(false);
  const [remainingTime, setRemainingTime] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/v1/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone,
          code: verificationCode
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Verification failed');
      }

      // If verification successful, proceed with user registration
      await registerUser(userData);
      toast.success("Phone number verified and account created!");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Verification failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (remainingTime > 0) return;
    
    setIsResendingCode(true);
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const sent = await sendOTP(phone, code);
      if (sent) {
        toast.success('New verification code sent');
        setRemainingTime(60);
      } else {
        throw new Error('Failed to send new code');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend code');
    } finally {
      setIsResendingCode(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-center">
        Enter the 6-digit code sent to {phone}
      </h2>
      <InputOTP
        maxLength={6}
        value={verificationCode}
        onChange={setVerificationCode}
        className="gap-2"
      >
        <InputOTPGroup>
          {Array.from({ length: 6 }).map((_, i) => (
            <InputOTPSlot key={i} index={i} />
          ))}
        </InputOTPGroup>
      </InputOTP>
      <div className="flex justify-between items-center text-sm">
        {remainingTime > 0 ? (
          <span>Resend available in {remainingTime}s</span>
        ) : (
          <Button 
            onClick={handleResend} 
            disabled={isResendingCode} 
            variant="link"
            className="p-0"
          >
            {isResendingCode ? 'Resending...' : 'Resend Code'}
          </Button>
        )}
      </div>
      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline">Back</Button>
        <Button 
          onClick={handleVerify} 
          disabled={isSubmitting || verificationCode.length !== 6}
        >
          {isSubmitting ? 'Verifying...' : 'Verify'}
        </Button>
      </div>
    </div>
  );
};

export default VerificationForm;
