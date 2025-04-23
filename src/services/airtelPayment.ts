
import { toast } from "@/components/ui/sonner";

export interface AirtelPaymentRequest {
  amount: number;
  phoneNumber: string;
  reference: string;
}

export async function initiateAirtelPayment(data: AirtelPaymentRequest): Promise<boolean> {
  try {
    const response = await fetch('/api/airtel-collect', {
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
    console.log('Airtel payment initiated:', result);
    toast.success("Payment request sent. Please check your phone for the prompt.");
    return true;
  } catch (error) {
    console.error('Airtel payment failed:', error);
    toast.error("Failed to initiate payment. Please try again.");
    return false;
  }
}
