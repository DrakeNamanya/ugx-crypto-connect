
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
import { mobileMoneyProviders, initiateWithdrawal, getUSDTRate } from '@/services/api';
import { useQuery } from '@tanstack/react-query';

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
      setIsSubmitting(true);
      
      // Call the withdrawal API
      const result = await initiateWithdrawal({
        amount: values.amount,
        phoneNumber: values.phoneNumber,
        provider: values.provider,
      });
      
      toast.success('Withdrawal request initiated successfully');
      toast.info(`You will receive funds on your mobile money shortly. Reference: ${result.reference}`);
      
      // Reset the form
      form.reset();
    } catch (error) {
      toast.error('Failed to initiate withdrawal. Please try again.');
      console.error('Withdrawal error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate equivalent USDT value
  const ugxAmount = form.watch('amount') || 0;
  const usdtEquivalent = rateData ? (ugxAmount / rateData.sell).toFixed(2) : '0.00';

  return (
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
  );
};

export default WithdrawalForm;
