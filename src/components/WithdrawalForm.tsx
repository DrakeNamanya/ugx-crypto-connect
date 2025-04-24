
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
import { mobileMoneyProviders, getUSDTRate } from '@/services/api';
import { initiateAirtelWithdrawal } from '@/services/airtelDisbursement';
import { useQuery } from '@tanstack/react-query';
import { canMakeHighValueTransaction, isKYCVerified } from '@/services/kycVerification';
import { Link } from 'react-router-dom';

// Define the KYC limits
const KYC_WITHDRAWAL_LIMIT = 50000; // 50,000 UGX

// Form validation schema
const formSchema = z.object({
  amount: z.coerce.number().min(10000, { message: 'Minimum withdrawal is 10,000 UGX' }),
  phoneNumber: z.string().regex(/^(0|256|\+256)7[0-9]{8}$/, { 
    message: 'Please enter a valid Ugandan phone number' 
  }),
  provider: z.enum(['MTN', 'AIRTEL'], {
    required_error: 'Please select a mobile money provider',
  }),
});

type WithdrawalFormValues = z.infer<typeof formSchema>;

const WithdrawalForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isVerified = isKYCVerified();

  // Fetch current USDT rate
  const { data: rateData } = useQuery({
    queryKey: ['usdtRate'],
    queryFn: getUSDTRate,
  });

  const form = useForm<WithdrawalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: undefined,
      phoneNumber: '',
      provider: undefined,
    },
  });

  const onSubmit = async (values: WithdrawalFormValues) => {
    try {
      // Check if user can make high value transaction
      if (!canMakeHighValueTransaction(values.amount, false)) {
        return;
      }
      
      setIsSubmitting(true);
      
      // Generate a unique reference for this transaction
      const reference = `WDR${Math.random().toString(36).substring(2, 10)}${Date.now()}`;
      
      if (values.provider === 'AIRTEL') {
        const result = await initiateAirtelWithdrawal({
          amount: values.amount,
          phoneNumber: values.phoneNumber,
          reference,
        });
        
        if (result) {
          toast.success('Withdrawal request processed successfully');
          toast.info(`Funds will be sent to ${values.phoneNumber}`, {
            description: `Reference: ${reference}`,
          });
          form.reset();
        }
      } else {
        // MTN implementation will go here when ready
        toast.error('MTN integration coming soon');
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast.error('Failed to process withdrawal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate equivalent USDT value
  const ugxAmount = form.watch('amount') || 0;
  const usdtEquivalent = rateData ? (ugxAmount / rateData.sell).toFixed(2) : '0.00';

  return (
    <div>
      {!isVerified && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> Unverified accounts can only withdraw up to {KYC_WITHDRAWAL_LIMIT.toLocaleString()} UGX.{' '}
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
                    placeholder="50,000" 
                    {...field} 
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                {ugxAmount > 0 && rateData && (
                  <p className="text-sm text-muted-foreground">
                    ≈ {usdtEquivalent} USDT at 1 USDT = {rateData.sell} UGX
                  </p>
                )}
                {!isVerified && (
                  <p className="text-xs text-muted-foreground">
                    Maximum withdrawal without verification: {KYC_WITHDRAWAL_LIMIT.toLocaleString()} UGX
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
            {isSubmitting ? 'Processing...' : 'Withdraw Funds'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default WithdrawalForm;
