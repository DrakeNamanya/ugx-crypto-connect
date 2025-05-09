
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from '@/components/ui/input-otp';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// This component is temporarily disabled as we've switched to email verification
// It will be reimplemented later with Twilio integration for phone verification

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

// This is a placeholder component that will be fully implemented later
const VerificationForm: React.FC<VerificationFormProps> = ({ phone, onBack, onSuccess }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification Disabled</CardTitle>
        <CardDescription>
          Phone verification is currently disabled. Please use email verification instead.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center">
          This feature will be reimplemented in the final stage of development.
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={onBack} variant="outline">Back</Button>
        <Button onClick={onSuccess}>Continue</Button>
      </CardFooter>
    </Card>
  );
};

export default VerificationForm;
