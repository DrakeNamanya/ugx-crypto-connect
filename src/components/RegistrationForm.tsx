
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from '@/components/ui/sonner';
import { Form } from '@/components/ui/form';
import { sendOTP, validateUgandanPhone } from '@/services/api';
import VerificationForm from './auth/VerificationForm';
import RegistrationFormFields from './auth/RegistrationFormFields';

const ugandanPhoneRegex = /^\+256(7|3)\d{8}$/;

const formSchema = z.object({
  fullName: z.string().min(3, { message: 'Full name must be at least 3 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().refine(phone => {
    const formatted = formatPhoneNumber(phone);
    return ugandanPhoneRegex.test(formatted);
  }, { 
    message: 'Please enter a valid Ugandan phone number (e.g., 0771234567 or +256771234567)' 
  }),
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[A-Z]/, { message: 'Must contain at least one uppercase letter' })
    .regex(/[0-9]/, { message: 'Must contain at least one number' })
    .regex(/[^A-Za-z0-9]/, { message: 'Must contain at least one special character' }),
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

const formatPhoneNumber = (phone: string): string => {
  return phone
    .replace(/\D/g, '') // Remove all non-digit characters
    .replace(/^0/, '256') // Replace leading 0 with 256
    .replace(/^/, '+'); // Add + prefix
};

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
      
      // Format phone number to E.164 standard
      const formattedPhone = formatPhoneNumber(values.phone);

      // Validate phone number format
      if (!validateUgandanPhone(formattedPhone)) {
        toast.error('Invalid Ugandan phone number format');
        return;
      }

      // Send OTP request
      const { success, debugCode, error } = await sendOTP(formattedPhone);
      
      if (!success) {
        throw new Error(error || 'Failed to send verification code');
      }

      // Store user data for verification step
      setUserData({ 
        ...values, 
        phone: formattedPhone 
      });
      setVerificationMode(true);

      // Show debug code in development
      if (process.env.NODE_ENV === 'development' && debugCode) {
        toast.info(`Development Mode: OTP is ${debugCode}`, {
          duration: 30000,
          important: true,
        });
      }

      toast.success('Verification code sent to your phone');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to start registration',
        {
          action: {
            label: 'Retry',
            onClick: () => onSubmit(values),
          },
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (verificationMode && userData) {
    // Ensure all required properties are present when passing to VerificationForm
    return (
      <VerificationForm
        phone={userData.phone}
        onBack={() => setVerificationMode(false)}
        onSuccess={onSuccess}
        userData={{
          fullName: userData.fullName,
          email: userData.email,
          phone: userData.phone,
          password: userData.password
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
