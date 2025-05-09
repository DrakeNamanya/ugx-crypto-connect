
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import RegistrationFormFields from './auth/RegistrationFormFields';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  fullName: z.string().min(3, { message: 'Full name must be at least 3 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number' }),
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

const RegistrationForm = ({ onSuccess }: RegistrationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      
      // Register the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
            phone: values.phone,
          },
        }
      });
      
      if (error) {
        throw error;
      }

      // Check if email confirmation is required (always true unless disabled in Supabase)
      if (data.user && !data.session) {
        toast.success(
          "Registration successful! Please check your email to verify your account.",
          { duration: 6000 }
        );
      } else {
        // In case email confirmation is disabled in Supabase
        toast.success("Account created successfully!");
      }

      // Initialize KYC status in local storage
      localStorage.setItem('userCreationDate', new Date().toISOString());
      localStorage.setItem('kycStatus', JSON.stringify({
        isVerified: false,
        submittedAt: null,
        expiryDate: null,
        reminderCount: 0
      }));

      onSuccess();
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to create account',
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
