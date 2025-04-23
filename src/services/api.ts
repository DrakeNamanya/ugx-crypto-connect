
// API service for UGXchange

// Base URL for API requests
const API_BASE_URL = '/api/v1';

// Mobile Money Integration
export const mobileMoneyProviders = {
  MTN: 'MTN Mobile Money',
  AIRTEL: 'Airtel Money'
};

export interface DepositRequest {
  amount: number;
  phoneNumber: string;
  provider: 'MTN' | 'AIRTEL';
}

export interface WithdrawalRequest {
  amount: number;
  phoneNumber: string;
  provider: 'MTN' | 'AIRTEL';
}

export interface UserRegistration {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface CryptoTransferRequest {
  amount: number;
  walletAddress: string;
  asset: string; // e.g., 'USDT'
}

// Import Airtel payment functionality
export { initiateAirtelPayment } from './airtelPayment';

// Generic fetch function with error handling
const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// User Registration
export const registerUser = async (userData: UserRegistration): Promise<{ success: boolean; message: string }> => {
  const response = await fetchApi('/users/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  
  return response;
};

// Mobile Money Deposit
export const initiateDeposit = async (request: DepositRequest): Promise<{ reference: string }> => {
  console.log('Initiating deposit:', request);
  
  const response = await fetchApi('/deposit/mobile-money', {
    method: 'POST',
    body: JSON.stringify(request),
  });
  
  return { reference: response.reference };
};

// Mobile Money Withdrawal
export const initiateWithdrawal = async (request: WithdrawalRequest): Promise<{ reference: string }> => {
  console.log('Initiating withdrawal:', request);
  
  const response = await fetchApi('/withdraw/mobile-money', {
    method: 'POST',
    body: JSON.stringify(request),
  });
  
  return { reference: response.reference };
};

// Get USDT Exchange Rate
export const getUSDTRate = async (): Promise<{ buy: number; sell: number }> => {
  const response = await fetchApi('/rates');
  return response;
};

// Crypto Transfer
export const transferCrypto = async (request: CryptoTransferRequest): Promise<{ txId: string }> => {
  console.log('Initiating crypto transfer:', request);
  
  const response = await fetchApi('/crypto/transfer', {
    method: 'POST',
    body: JSON.stringify(request),
  });
  
  return { txId: response.txId };
};

// Get Transaction History
export const getTransactions = async (): Promise<any[]> => {
  const response = await fetchApi('/transactions');
  return response.transactions;
};

// Validate Ugandan Phone Number
export const validateUgandanPhone = (phone: string): boolean => {
  const ugandanPhoneRegex = /^(0|256|\+256)7[0-9]{8}$/;
  return ugandanPhoneRegex.test(phone);
};
