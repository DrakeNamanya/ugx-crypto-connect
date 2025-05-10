
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mobileMoneyProviders } from '@/services/api';
import { canMakeHighValueTransaction, isKYCVerified } from '@/services/kycVerification';
import { Link } from 'react-router-dom';
import { processMobileMoneyDeposit, generateTransactionRef } from '@/services/mobileMoney';

// Define the KYC limits
const KYC_DEPOSIT_LIMIT = 200000; // 200,000 UGX

const formSchema = z.object({
  amount: z.coerce.number().min(5000, { message: 'Minimum deposit is 5,000 UGX' }),
  phoneNumber: z.string().regex(/^(0|256|\+256)7[0-9]{8}$/, { 
    message: 'Please enter a valid Ugandan phone number' 
  }),
  provider: z.enum(['MTN', 'AIRTEL'], {
    required_error: 'Please select a mobile money provider',
  }),
});

type DepositFormValues = z.infer<typeof formSchema>;

const DepositForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isVerified = isKYCVerified();

  const form = useForm<DepositFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: undefined,
      phoneNumber: '',
      provider: undefined,
    },
  });

  const onSubmit = async (values: DepositFormValues) => {
    try {
      // Check if user can make high value transaction
      if (!canMakeHighValueTransaction(values.amount, true)) {
        return;
      }
      
      setIsSubmitting(true);
      
      // Generate a unique reference for this transaction
      const reference = generateTransactionRef();
      
      // Process the deposit using our new mobile money service
      const result = await processMobileMoneyDeposit({
        amount: values.amount,
        phoneNumber: values.phoneNumber,
        provider: values.provider as 'MTN' | 'AIRTEL',
        reference
      });
      
      if (result.success) {
        toast.success('Collection request sent successfully');
        toast.info(`Please check your phone (${values.phoneNumber}) for the payment prompt`, {
          description: `Reference: ${result.reference}`,
        });
        form.reset();
      } else {
        toast.error(`Failed to process deposit: ${result.message}`);
      }
    } catch (error) {
      console.error('Deposit error:', error);
      toast.error('Failed to initiate deposit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {!isVerified && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> Unverified accounts can only deposit up to {KYC_DEPOSIT_LIMIT.toLocaleString()} UGX.{' '}
            <Link to="/kyc-verification" className="underline font-medium">
              Verify your identity
            </Link> to increase your limit.
          </p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount (UGX)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="10,000" 
                    {...field} 
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                {!isVerified && (
                  <p className="text-xs text-muted-foreground">
                    Maximum deposit without verification: {KYC_DEPOSIT_LIMIT.toLocaleString()} UGX
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mobile Money Number</FormLabel>
                <FormControl>
                  <Input placeholder="0771234567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="provider"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mobile Money Provider</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(mobileMoneyProviders).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="ugx-button-primary w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Deposit Funds'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default DepositForm;
