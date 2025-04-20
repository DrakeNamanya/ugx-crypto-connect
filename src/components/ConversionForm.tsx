
import React, { useState, useEffect } from 'react';
import { ArrowDownUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getUSDTRate } from '@/services/api';
import { toast } from 'sonner';

const ConversionForm = () => {
  const [fromCurrency, setFromCurrency] = useState('UGX');
  const [toCurrency, setToCurrency] = useState('USDT');
  const [amount, setAmount] = useState('');
  const [convertedAmount, setConvertedAmount] = useState('');
  const [rates, setRates] = useState({ buy: 3700, sell: 3650 });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch rates on component mount
  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const rateData = await getUSDTRate();
      setRates(rateData);
    } catch (error) {
      console.error('Error fetching rates:', error);
      toast.error('Failed to fetch current exchange rates');
    }
  };

  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    setAmount('');
    setConvertedAmount('');
  };

  const handleConvert = () => {
    if (!amount) return;
    
    const numAmount = parseFloat(amount);
    
    if (fromCurrency === 'UGX' && toCurrency === 'USDT') {
      setConvertedAmount((numAmount / rates.sell).toFixed(2));
    } else if (fromCurrency === 'USDT' && toCurrency === 'UGX') {
      setConvertedAmount((numAmount * rates.buy).toFixed(2));
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-700">From</label>
          <Select
            value={fromCurrency}
            onValueChange={setFromCurrency}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UGX">UGX</SelectItem>
              <SelectItem value="USDT">USDT</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Input
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="ugx-input"
        />
      </div>
      
      <div className="flex justify-center">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleSwap}
          className="rounded-full bg-gray-100 hover:bg-gray-200"
        >
          <ArrowDownUp size={20} />
        </Button>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-700">To</label>
          <Select
            value={toCurrency}
            onValueChange={setToCurrency}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UGX">UGX</SelectItem>
              <SelectItem value="USDT">USDT</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Input
          type="text"
          placeholder="0.00"
          value={convertedAmount}
          readOnly
          className="ugx-input bg-gray-50"
        />
      </div>
      
      {fromCurrency && toCurrency && (
        <div className="text-xs text-gray-500 text-center">
          Exchange Rate: {fromCurrency === 'UGX' 
            ? `1 USDT = ${rates.sell.toLocaleString()} UGX` 
            : `1 UGX = ${(1/rates.buy).toFixed(6)} USDT`}
        </div>
      )}
      
      <Button 
        onClick={handleConvert}
        className="w-full ugx-button-primary mt-4"
      >
        Convert
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={fetchRates}
        className="w-full text-xs"
      >
        Refresh Rates
      </Button>
    </div>
  );
};

export default ConversionForm;
