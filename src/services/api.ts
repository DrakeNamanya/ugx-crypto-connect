// API service for UGXchange
const API_BASE_URL = '/api/v1';
import axios from 'axios';

// Mobile Money Integration
export const mobileMoneyProviders = {
  MTN: 'MTN Mobile Money',
  AIRTEL: 'Airtel Money',
  AFRICELL: 'Africell Money'
};

// Interfaces (keep existing and add email-related ones)
export interface DepositRequest {
  amount: number;
  phoneNumber: string;
  provider: 'MTN' | 'AIRTEL' | 'AFRICELL';
}

export interface WithdrawalRequest {
  amount: number;
  phoneNumber: string;
  provider: 'MTN' | 'AIRTEL' | 'AFRICELL';
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
  asset: string;
  network?: 'TRC20' | 'ERC20' | 'BEP20';
}

// Improved phone validation with better regex
export const validateUgandanPhone = (phone: string): boolean => {
  const regex = /^\+256(7|3)\d{8}$/;
  return regex.test(phone);
};

// Enhanced fetchApi with TypeScript generic support
const fetchApi = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data as T;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// Keep existing API functions and add improvements
export const registerUser = async (userData: UserRegistration) => {
  return fetchApi<{ success: boolean; message: string }>('/users/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

// Improved rate fetching with better error typing
interface ExchangeRateResponse {
  buy: number;
  sell: number;
}

export const getUSDTRate = async (): Promise<ExchangeRateResponse> => {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: { ids: 'tether', vs_currencies: 'ugx' }
    });

    const baseRate = response.data.tether.ugx || 3700;
    const profitMargin = 50;

    return {
      buy: Math.ceil(baseRate + profitMargin),
      sell: Math.floor(baseRate - profitMargin)
    };
  } catch (error) {
    console.error('Rate fetch error:', error);
    return { buy: 3750, sell: 3650 };
  }
};

// Existing functions remain unchanged
export { initiateAirtelPayment } from './airtelPayment';

export const initiateDeposit = async (request: DepositRequest) => {
  return fetchApi<{ reference: string }>('/deposit/mobile-money', {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

export const initiateWithdrawal = async (request: WithdrawalRequest) => {
  return fetchApi<{ reference: string }>('/withdraw/mobile-money', {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

export const transferCrypto = async (request: CryptoTransferRequest) => {
  return fetchApi<{ txId: string }>('/crypto/transfer', {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

export const getTransactions = async () => {
  return fetchApi<{ transactions: any[] }>('/transactions');
};
