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
    message: 'Please enter a valid Ugandan phone number (e.g., 0771234567 or +256771234567)' 
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

  const onSubmit = async (values: RegistrationFormValues) => {
    try {
      setIsSubmitting(true);

      // Validate phone number
      const formattedPhone = values.phone.startsWith('+') 
        ? values.phone 
        : values.phone.startsWith('0') 
          ? '+256' + values.phone.substring(1) 
          : '+256' + values.phone;

      if (!validateUgandanPhone(formattedPhone)) {
        toast.error('Please enter a valid Ugandan phone number');
        setIsSubmitting(false);
        return;
      }

      // Generate and send OTP
      const response = await fetch('/api/v1/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: formattedPhone,
          code: Math.floor(100000 + Math.random() * 900000).toString()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to send verification code');
      }

      // Store the user data and move to verification mode
      setUserData({
        ...values,
        phone: formattedPhone
      });
      setVerificationMode(true);
      toast.success('Verification code sent to your phone');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to start registration');
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
        userData={userData}
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
