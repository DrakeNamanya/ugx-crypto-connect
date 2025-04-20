import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { registerUser } from '@/services/api';

// Regex pattern for Ugandan phone numbers
const ugandanPhoneRegex = /^(0|256|\+256)7[0-9]{8}$/;

// Form validation schema
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

type RegistrationFormValues = z.infer<typeof formSchema>;

interface RegistrationFormProps {
  onSuccess: () => void;
}

const RegistrationForm = ({ onSuccess }: RegistrationFormProps) => {
  const [verificationMode, setVerificationMode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isResendingCode, setIsResendingCode] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
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
      
      // Store the user data for later registration
      setUserData(values);
      
      // Simulate sending verification code
      toast.info('Verification code sent to your phone');
      setVerificationMode(true);
      
      // Start the resend timer
      startResendTimer();
    } catch (error) {
      toast.error('Registration failed. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
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

  const handleResendCode = () => {
    if (remainingTime > 0) return;
    
    setIsResendingCode(true);
    
    // Simulate API call to resend code
    setTimeout(() => {
      toast.info('New verification code sent to your phone');
      setIsResendingCode(false);
      startResendTimer();
    }, 1000);
  };

  const handleVerification = async () => {
    if (verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit verification code');
      return;
    }

    if (!userData) {
      toast.error('Registration data not found');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Call the API to register the user
      const result = await registerUser({
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        password: userData.password
      });
      
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

  if (verificationMode) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-medium">Verify your phone number</h3>
          <p className="text-sm text-gray-600 mt-1">
            We've sent a 6-digit code to your phone number
          </p>
        </div>
        
        <div className="flex flex-col items-center gap-4">
          <InputOTP 
            maxLength={6}
            value={verificationCode}
            onChange={setVerificationCode}
            render={({ slots }) => (
              <InputOTPGroup>
                {slots.map((slot, index) => (
                  <InputOTPSlot key={index} index={index} />
                ))}
              </InputOTPGroup>
            )}
          />
          
          <Button 
            onClick={handleVerification}
            disabled={isSubmitting}
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
              onClick={() => setVerificationMode(false)}
              className="text-sm"
            >
              Back to registration
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="your@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number (Ugandan)</FormLabel>
              <FormControl>
                <Input placeholder="0771234567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 bg-muted">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  I accept the terms and conditions
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Processing...' : 'Create Account'}
        </Button>
      </form>
    </Form>
  );
};

export default RegistrationForm;
