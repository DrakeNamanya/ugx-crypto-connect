
import axios from 'axios';
import { toast } from '@/components/ui/sonner';
import { handleApiError, isThrottled } from '@/lib/api-helpers';

// Types
export interface MobileMoneyRequest {
  phoneNumber: string;
  amount: number;
  provider: 'MTN' | 'AIRTEL';
  reference?: string;
}

export interface MobileMoneyResponse {
  success: boolean;
  reference: string;
  message: string;
  transactionId?: string;
}

// Generate a unique transaction reference
export const generateTransactionRef = (): string => {
  return `TX${Date.now()}${Math.floor(Math.random() * 10000)}`;
};

// Base URLs for different provider APIs (replace with actual endpoints in a real implementation)
const PROVIDER_URLS = {
  MTN: '/api/v1/mtn/payment',
  AIRTEL: '/api/v1/airtel/payment'
};

// Process mobile money deposit
export const processMobileMoneyDeposit = async (request: MobileMoneyRequest): Promise<MobileMoneyResponse> => {
  try {
    // Check if requests are being throttled
    if (isThrottled('mobile-money-deposit')) {
      throw new Error('Too many requests. Please try again later.');
    }

    const { phoneNumber, amount, provider } = request;
    const reference = request.reference || generateTransactionRef();
    
    console.log(`Initiating ${provider} mobile money deposit of ${amount} UGX from ${phoneNumber}`);
    
    // Get the appropriate API endpoint for the provider
    const endpoint = PROVIDER_URLS[provider];
    
    // Format the phone number (remove leading 0 and add country code if needed)
    const formattedPhone = phoneNumber.startsWith('+') 
      ? phoneNumber 
      : phoneNumber.startsWith('0')
        ? `+256${phoneNumber.substring(1)}`
        : `+256${phoneNumber}`;
    
    // Make API request to the mobile money provider
    const response = await axios.post(endpoint, {
      amount: amount,
      phoneNumber: formattedPhone,
      reference: reference,
      currency: 'UGX',
      description: `UGXchange deposit of ${amount} UGX`
    }, {
      headers: {
        'Content-Type': 'application/json',
        // In a real implementation, you would include authentication headers
      }
    });
    
    // Log the response for debugging
    console.log('Mobile money API response:', response.data);
    
    return {
      success: true,
      reference: reference,
      message: `${provider} payment request sent successfully`,
      transactionId: response.data.transactionId || reference
    };
  } catch (error) {
    const errorMessage = handleApiError(error, 'Mobile money deposit');
    console.error('Mobile money deposit error:', error);
    
    toast.error(`Mobile money deposit failed: ${errorMessage}`);
    
    return {
      success: false,
      reference: request.reference || '',
      message: errorMessage
    };
  }
};

// Process mobile money withdrawal
export const processMobileMoneyWithdrawal = async (request: MobileMoneyRequest): Promise<MobileMoneyResponse> => {
  try {
    // Check if requests are being throttled
    if (isThrottled('mobile-money-withdrawal')) {
      throw new Error('Too many requests. Please try again later.');
    }

    const { phoneNumber, amount, provider } = request;
    const reference = request.reference || generateTransactionRef();
    
    console.log(`Initiating ${provider} mobile money withdrawal of ${amount} UGX to ${phoneNumber}`);
    
    // Get the appropriate API endpoint for the provider
    const endpoint = PROVIDER_URLS[provider].replace('payment', 'withdrawal');
    
    // Format the phone number (remove leading 0 and add country code if needed)
    const formattedPhone = phoneNumber.startsWith('+') 
      ? phoneNumber 
      : phoneNumber.startsWith('0')
        ? `+256${phoneNumber.substring(1)}`
        : `+256${phoneNumber}`;
    
    // Make API request to the mobile money provider
    const response = await axios.post(endpoint, {
      amount: amount,
      phoneNumber: formattedPhone,
      reference: reference,
      currency: 'UGX',
      description: `UGXchange withdrawal of ${amount} UGX`
    }, {
      headers: {
        'Content-Type': 'application/json',
        // In a real implementation, you would include authentication headers
      }
    });
    
    // Log the response for debugging
    console.log('Mobile money API response:', response.data);
    
    return {
      success: true,
      reference: reference,
      message: `${provider} withdrawal request sent successfully`,
      transactionId: response.data.transactionId || reference
    };
  } catch (error) {
    const errorMessage = handleApiError(error, 'Mobile money withdrawal');
    console.error('Mobile money withdrawal error:', error);
    
    toast.error(`Mobile money withdrawal failed: ${errorMessage}`);
    
    return {
      success: false,
      reference: request.reference || '',
      message: errorMessage
    };
  }
};

// Check transaction status
export const checkMobileMoneyStatus = async (reference: string): Promise<{ status: string, message: string }> => {
  try {
    const response = await axios.get(`/api/v1/mobile-money/status/${reference}`);
    
    return {
      status: response.data.status,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error checking transaction status:', error);
    return {
      status: 'unknown',
      message: 'Failed to retrieve transaction status'
    };
  }
};
