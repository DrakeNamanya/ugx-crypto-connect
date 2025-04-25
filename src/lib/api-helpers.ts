
import { toast } from "@/components/ui/sonner";

// API request throttling to prevent abuse
const requestThrottle = new Map<string, number>();
const THROTTLE_LIMIT = 10; // max requests per minute for a specific endpoint
const THROTTLE_WINDOW = 60 * 1000; // 1 minute window

export const isThrottled = (endpoint: string): boolean => {
  const now = Date.now();
  const key = `${endpoint}`;
  
  // Clean up old entries
  for (const [storedKey, timestamp] of requestThrottle.entries()) {
    if (now - timestamp > THROTTLE_WINDOW) {
      requestThrottle.delete(storedKey);
    }
  }
  
  // Count requests for this endpoint in the time window
  let count = 0;
  for (const [storedKey, _] of requestThrottle.entries()) {
    if (storedKey.startsWith(key)) {
      count++;
    }
  }
  
  // Check if limit is reached
  if (count >= THROTTLE_LIMIT) {
    toast.error("Too many requests. Please try again later.");
    return true;
  }
  
  // Track this request
  requestThrottle.set(`${key}_${now}`, now);
  return false;
};

// Standardized error handler for API requests
export const handleApiError = (error: any, context: string = 'API request'): string => {
  console.error(`Error in ${context}:`, error);
  
  let errorMessage = 'An unexpected error occurred';
  
  if (error?.message) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error?.response?.data?.message) {
    errorMessage = error.response.data.message;
  }
  
  if (error?.response?.status === 429) {
    errorMessage = 'Too many requests. Please try again later.';
  } else if (error?.response?.status === 401) {
    errorMessage = 'Authentication required. Please log in again.';
  } else if (error?.response?.status === 403) {
    errorMessage = 'You do not have permission to perform this action.';
  } else if (error?.response?.status >= 500) {
    errorMessage = 'Server error. Please try again later.';
  }
  
  // In a real app, you would log this error to your monitoring system
  
  return errorMessage;
};

// Environment-aware configuration
export const getApiConfig = () => {
  const isProd = import.meta.env.PROD;
  
  return {
    apiUrl: isProd 
      ? 'https://api.ugxchange.com/v1' 
      : '/api/v1',
    timeouts: {
      short: 5000, // 5 seconds
      default: 15000, // 15 seconds
      long: 30000 // 30 seconds
    },
    retries: isProd ? 2 : 1
  };
};
