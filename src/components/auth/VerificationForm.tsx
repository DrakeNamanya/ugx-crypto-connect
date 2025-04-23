
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from '@/components/ui/input-otp';
import { registerUser } from '@/services/api';
import { sendOtp } from '@/services/sendOtp';

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

const VerificationForm: React.FC<VerificationFormProps> = ({ phone, onBack, onSuccess, userData }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResendingCode, setIsResendingCode] = useState(false);
  const [remainingTime, setRemainingTime] = useState(60);

  useEffect(() => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    sendOtp(phone, code);
  }, [phone]);

  const handleVerify = async () => {
    setIsSubmitting(true);
    if (verificationCode === generatedCode) {
      try {
        await registerUser(userData);
        toast.success("Phone number verified!");
        onSuccess();
      } catch (error) {
        toast.error("Registration failed.");
      }
    } else {
      toast.error("Incorrect verification code.");
    }
    setIsSubmitting(false);
  };

  const handleResend = async () => {
    if (remainingTime > 0) return;
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(newCode);
    setIsResendingCode(true);
    await sendOtp(phone, newCode);
    setIsResendingCode(false);
    setRemainingTime(60);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-center">Enter the 6-digit code sent to {phone}</h2>
      <InputOTP
        maxLength={6}
        value={verificationCode}
        onChange={setVerificationCode}
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
          <button onClick={handleResend} disabled={isResendingCode}>
            {isResendingCode ? 'Resending...' : 'Resend Code'}
          </button>
        )}
      </div>
      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline">Back</Button>
        <Button onClick={handleVerify} disabled={isSubmitting}>
          {isSubmitting ? 'Verifying...' : 'Verify'}
        </Button>
      </div>
    </div>
  );
};

export default VerificationForm;
