
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from '@/components/ui/sonner';
import { Form } from '@/components/ui/form';
import { validateUgandanPhone } from '@/services/api';
import VerificationForm from './auth/VerificationForm';
import RegistrationFormFields from './auth/RegistrationFormFields';

const ugandanPhoneRegex = /^(0|256|\+256)7[0-9]{8}$/;

const formSchema = z.object({
  fullName: z.string().min(3, { message: 'Full name must be at least 3 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().regex(ugandanPhoneRegex, { 
    message: 'Please enter a valid Ugandan phone number starting with 07, 2567, or +2567' 
  }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, { 
    message: 'You must accept the terms and conditions' 
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type RegistrationFormValues = z.infer<typeof formSchema>;

interface RegistrationFormProps {
  onSuccess: () => void;
}

const RegistrationForm = ({ onSuccess }: RegistrationFormProps) => {
  const [verificationMode, setVerificationMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState<RegistrationFormValues | null>(null);

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  });

  const sendOtpToPhone = async (phone: string) => {
    try {
      const res = await fetch('/api/v1/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || 'Failed to send verification code');
        return false;
      }
      toast.success('Verification code sent to your phone');
      return true;
    } catch (e) {
      toast.error('Failed to send verification code.');
      return false;
    }
  };

  const onSubmit = async (values: RegistrationFormValues) => {
    try {
      setIsSubmitting(true);

      // Validate phone number
      if (!validateUgandanPhone(values.phone)) {
        toast.error('Please enter a valid Ugandan phone number');
        setIsSubmitting(false);
        return;
      }

      // Send OTP to phone
      const sent = await sendOtpToPhone(values.phone);
      if (!sent) {
        setIsSubmitting(false);
        return;
      }

      // Store the user data for later registration
      setUserData(values);

      setVerificationMode(true);
    } catch (error) {
      toast.error('Registration failed. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (verificationMode && userData) {
    return (
      <VerificationForm
        phone={userData.phone}
        onBack={() => setVerificationMode(false)}
        onSuccess={onSuccess}
        userData={{
          fullName: userData.fullName,
          email: userData.email,
          phone: userData.phone,
          password: userData.password,
        }}
      />
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <RegistrationFormFields
          form={form}
          isSubmitting={isSubmitting}
        />
      </form>
    </Form>
  );
};

export default RegistrationForm;
