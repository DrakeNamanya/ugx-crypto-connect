import { serve } from 'https://deno.land/std@0.197.0/http/server.ts';

const AIRTEL_API_URL = 'https://openapiuat.airtel.africa/merchant/v2/payments/';

interface RequestBody {
  amount: number;
  phoneNumber: string;
  reference: string;
}

serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const { amount, phoneNumber, reference }: RequestBody = await req.json();

    // Clean up the phone number format (remove +256 or 256 prefix if present)
    const cleanPhoneNumber = phoneNumber.replace(/^\+?256/, '0');

    const headers = {
      'Accept': '*/*',
      'Content-Type': 'application/json',
      'X-Country': 'UG',
      'X-Currency': 'UGX',
      'Authorization': `Bearer ${Deno.env.get('AIRTEL_AUTH_TOKEN')}`,
      'X-Merchant-Code': 'FZIQOYM9',
      'X-Reference-Id': reference,
    };

    const body = {
      reference,
      subscriber: {
        country: 'UG',
        currency: 'UGX',
        msisdn: cleanPhoneNumber,
      },
      transaction: {
        amount,
        country: 'UG',
        currency: 'UGX',
        id: reference
      }
    };

    console.log('Making Airtel API request:', {
      url: AIRTEL_API_URL,
      method: 'POST',
      headers: { ...headers, Authorization: '[REDACTED]' },
      body
    });

    const response = await fetch(AIRTEL_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    const data = await response.json();
    console.log('Airtel API response:', data);

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return new Response(JSON.stringify({
      success: true,
      data
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Airtel collection error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'Failed to process payment request' 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});