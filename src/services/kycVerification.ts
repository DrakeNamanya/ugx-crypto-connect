
import { toast } from "@/components/ui/sonner";

export interface KYCStatus {
  isVerified: boolean;
  submittedAt: string | null;
  expiryDate: string | null;
  reminderCount: number;
}

// Initial KYC status
const defaultKYCStatus: KYCStatus = {
  isVerified: false,
  submittedAt: null,
  expiryDate: null,
  reminderCount: 0
};

// Get current KYC status from localStorage
export const getKYCStatus = (): KYCStatus => {
  const storedStatus = localStorage.getItem('kycStatus');
  if (!storedStatus) {
    return defaultKYCStatus;
  }

  try {
    return JSON.parse(storedStatus) as KYCStatus;
  } catch (e) {
    console.error('Error parsing KYC status:', e);
    return defaultKYCStatus;
  }
};

// Save KYC status to localStorage
export const saveKYCStatus = (status: KYCStatus): void => {
  localStorage.setItem('kycStatus', JSON.stringify(status));
};

// Check if KYC is verified
export const isKYCVerified = (): boolean => {
  return getKYCStatus().isVerified;
};

// Mark KYC as submitted (after form submission)
export const markKYCSubmitted = (): void => {
  const status = getKYCStatus();
  status.submittedAt = new Date().toISOString();
  saveKYCStatus(status);
};

// Mark KYC as verified (would be done by admin in a real app)
export const markKYCVerified = (): void => {
  const status = getKYCStatus();
  status.isVerified = true;
  status.expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // 1 year from now
  saveKYCStatus(status);
};

// Check if KYC has been submitted
export const isKYCSubmitted = (): boolean => {
  return getKYCStatus().submittedAt !== null;
};

// Check if account is blocked due to KYC non-compliance
export const isAccountBlocked = (): boolean => {
  const status = getKYCStatus();
  
  if (status.isVerified) {
    return false;
  }
  
  if (!status.submittedAt) {
    return false; // New users are not blocked immediately
  }
  
  const submittedDate = new Date(status.submittedAt);
  const daysSinceSubmission = Math.floor((Date.now() - submittedDate.getTime()) / (24 * 60 * 60 * 1000));
  
  return daysSinceSubmission > 5; // Block after 5 days if not verified
};

// Increment reminder count
export const incrementReminderCount = (): number => {
  const status = getKYCStatus();
  status.reminderCount += 1;
  saveKYCStatus(status);
  return status.reminderCount;
};

// Check if user can make a high-value transaction
export const canMakeHighValueTransaction = (amount: number, isDeposit: boolean): boolean => {
  if (isKYCVerified()) {
    return true; // Verified users can perform any transaction
  }
  
  // Unverified limits
  const depositLimit = 200000; // 200,000 UGX
  const withdrawalLimit = 50000; // 50,000 UGX
  
  if (isDeposit) {
    if (amount > depositLimit) {
      toast.error(`Unverified accounts can only deposit up to ${depositLimit.toLocaleString()} UGX`);
      return false;
    }
  } else {
    if (amount > withdrawalLimit) {
      toast.error(`Unverified accounts can only withdraw up to ${withdrawalLimit.toLocaleString()} UGX`);
      return false;
    }
  }
  
  return true;
};

// Show KYC reminder if needed
export const showKYCReminderIfNeeded = (): void => {
  const status = getKYCStatus();
  
  if (status.isVerified || isKYCSubmitted() || isAccountBlocked()) {
    return;
  }
  
  // Show reminder based on user's history with the app
  const userCreationDate = localStorage.getItem('userCreationDate');
  if (!userCreationDate) {
    localStorage.setItem('userCreationDate', new Date().toISOString());
    return;
  }
  
  const creationDate = new Date(userCreationDate);
  const daysSinceCreation = Math.floor((Date.now() - creationDate.getTime()) / (24 * 60 * 60 * 1000));
  
  if (daysSinceCreation >= 1 && status.reminderCount < 5) {
    toast.warning(
      'Verify your identity to unlock higher transaction limits',
      {
        description: 'Complete KYC verification to deposit more than 200,000 UGX or withdraw more than 50,000 UGX',
        action: {
          label: 'Verify Now',
          onClick: () => window.location.href = '/kyc-verification',
        },
        duration: 10000, // Show for 10 seconds
      }
    );
    
    incrementReminderCount();
  }
};
