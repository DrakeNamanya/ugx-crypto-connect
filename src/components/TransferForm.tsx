
import React, { useState } from 'react';
import { Copy, Send, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { transferCrypto, validateUgandanPhone } from '@/services/api';

interface TransferFormProps {
  direction: 'send' | 'receive';
}

const TransferForm = ({ direction }: TransferFormProps) => {
  const [walletAddress, setWalletAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Mock wallet address for receive
  const myWalletAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
  
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(myWalletAddress);
    toast.success('Wallet address copied to clipboard');
  };
  
  const handleTransfer = async () => {
    if (direction === 'send') {
      if (!walletAddress || !amount) {
        toast.error('Please fill in all fields');
        return;
      }
      
      setIsSubmitting(true);
      try {
        const result = await transferCrypto({
          amount: parseFloat(amount),
          walletAddress: walletAddress,
          asset: 'USDT'
        });
        
        toast.success(`Transfer initiated successfully. Transaction ID: ${result.txId}`);
        setWalletAddress('');
        setAmount('');
      } catch (error) {
        toast.error('Transfer failed. Please try again.');
        console.error('Transfer error:', error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (!amount || !phoneNumber) {
        toast.error('Please fill in all fields');
        return;
      }
      
      if (!validateUgandanPhone(phoneNumber)) {
        toast.error('Please enter a valid Ugandan phone number');
        return;
      }
      
      // Here we would handle the withdrawal to mobile money
      // For now, just show a success message
      toast.success('Withdrawal request submitted');
      setAmount('');
      setPhoneNumber('');
    }
  };
  
  return (
    <div className="space-y-4">
      {direction === 'send' ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="wallet-address">Recipient Wallet Address</Label>
            <Input
              id="wallet-address"
              placeholder="Enter wallet address"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="ugx-input"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USDT)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="ugx-input"
            />
          </div>
          
          <Button 
            onClick={handleTransfer}
            disabled={isSubmitting}
            className="w-full ugx-button-primary mt-4 flex items-center gap-2 justify-center"
          >
            <Send size={16} />
            {isSubmitting ? 'Processing...' : 'Send USDT'}
          </Button>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <Label>Your Wallet Address</Label>
            <div className="relative">
              <Input
                value={myWalletAddress}
                readOnly
                className="ugx-input pr-12 bg-gray-50"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={handleCopyAddress}
              >
                <Copy size={16} />
              </Button>
            </div>
            <p className="text-xs text-gray-500">Share this address to receive USDT</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="received-amount">Amount to Withdraw (USDT)</Label>
            <Input
              id="received-amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="ugx-input"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone-number">Mobile Money Number</Label>
            <Input
              id="phone-number"
              placeholder="e.g., 0772123456"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="ugx-input"
            />
          </div>
          
          <Button 
            onClick={handleTransfer}
            className="w-full ugx-button-secondary mt-4 flex items-center gap-2 justify-center"
          >
            <Download size={16} />
            Withdraw to Mobile Money
          </Button>
        </>
      )}
    </div>
  );
};

export default TransferForm;
