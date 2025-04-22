
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { 
  InputOTP, 
  InputOTPGroup, 
  InputOTPSlot 
} from '@/components/ui/input-otp';
import { registerUser } from '@/services/api';

interface UserData {
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

const VerificationForm = ({ phone, onBack, onSuccess, userData }: VerificationFormProps) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isResendingCode, setIsResendingCode] = useState(false);
  const [remainingTime, setRemainingTime] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Start timer on component mount
  useEffect(() => {
    startResendTimer();
  }, []);

  // Call API to resend code (Twilio)
  const resendCode = async () => {
    try {
      setIsResendingCode(true);
      
      // Format the phone number to include the country code if it doesn't already
      const formattedPhone = phone.startsWith('+') 
        ? phone 
        : phone.startsWith('0') 
          ? '+256' + phone.substring(1) 
          : phone;
          
      console.log('Resending OTP to:', formattedPhone);
      
      const res = await fetch('/api/v1/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formattedPhone }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${res.status}`);
      }
      
      const data = await res.json();
      if (data.success) {
        toast.success('New verification code sent to your phone');
        setRemainingTime(60);
      } else {
        toast.error(data.message || 'Failed to send code');
      }
    } catch (e) {
      console.error('OTP resending error:', e);
      toast.error('Failed to send code. Please check your connection and try again.');
    } finally {
      setIsResendingCode(false);
    }
  };

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

  // Resend code button
  const handleResendCode = async () => {
    if (remainingTime > 0) return;
    await resendCode();
    startResendTimer();
  };

  // Verifies OTP via API, then registers user
  const handleVerification = async () => {
    if (verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit verification code');
      return;
    }
    try {
      setIsSubmitting(true);
      
      // Format the phone number to include the country code if it doesn't already
      const formattedPhone = phone.startsWith('+') 
        ? phone 
        : phone.startsWith('0') 
          ? '+256' + phone.substring(1) 
          : phone;
          
      // Step 1: Verify OTP
      const resp = await fetch('/api/v1/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: formattedPhone, 
          code: verificationCode 
        }),
      });
      
      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${resp.status}`);
      }
      
      const data = await resp.json();
      if (!data.success) {
        toast.error(data.message || 'Verification failed');
        return;
      }
      
      // Step 2: Register user
      const result = await registerUser(userData);
      if (result.success) {
        toast.success('Phone number verified successfully');
        onSuccess();
      } else {
        toast.error(result.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Verification failed. Please try again.');
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
