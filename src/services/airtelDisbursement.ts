
import { toast } from "@/components/ui/sonner";

export interface AirtelDisbursementRequest {
  amount: number;
  phoneNumber: string;
  reference: string;
}

export async function initiateAirtelWithdrawal(data: AirtelDisbursementRequest): Promise<boolean> {
  try {
    const response = await fetch('/api/airtel-disburse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    const result = await response.json();
    console.log('Airtel withdrawal initiated:', result);
    toast.success("Withdrawal request sent successfully");
    return true;
  } catch (error) {
    console.error('Airtel withdrawal failed:', error);
    toast.error("Failed to initiate withdrawal. Please try again.");
    return false;
  }
}
