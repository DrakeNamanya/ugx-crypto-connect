
import { serve } from 'https://deno.fresh.dev/std@v1/http/server.ts';

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

    const headers = {
      'Accept': '*/*',
      'Content-Type': 'application/json',
      'X-Country': 'UG',
      'X-Currency': 'UGX',
      'Authorization': Deno.env.get('AIRTEL_AUTH_TOKEN'),
      'x-signature': Deno.env.get('AIRTEL_SIGNATURE'),
      'x-key': Deno.env.get('AIRTEL_API_KEY'),
    };

    const response = await fetch(AIRTEL_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        reference,
        subscriber: {
          country: 'UG',
          currency: 'UGX',
          msisdn: phoneNumber,
        },
        transaction: {
          amount,
          country: 'UG',
          currency: 'UGX',
          id: reference
        }
      })
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
      status: response.ok ? 200 : response.status,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
