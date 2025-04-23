
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
import { mobileMoneyProviders, initiateDeposit, initiateAirtelPayment } from '@/services/api';

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
      setIsSubmitting(true);
      
      if (values.provider === 'AIRTEL') {
        const reference = Math.random().toString(36).substring(7);
        const result = await initiateAirtelPayment({
          amount: values.amount,
          phoneNumber: values.phoneNumber,
          reference: reference,
        });
        
        if (result) {
          toast.success('Deposit request initiated successfully');
          toast.info(`Check your phone for payment prompt. Reference: ${reference}`);
          
          // Reset the form
          form.reset();
        }
      } else {
        const result = await initiateDeposit({
          amount: values.amount,
          phoneNumber: values.phoneNumber,
          provider: values.provider,
        });
        
        toast.success('Deposit request initiated successfully');
        toast.info(`Check your phone for payment prompt. Reference: ${result.reference}`);
        
        // Reset the form
        form.reset();
      }
    } catch (error) {
      toast.error('Failed to initiate deposit. Please try again.');
      console.error('Deposit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  placeholder="10,000" 
                  {...field} 
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
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
  );
};

export default DepositForm;
