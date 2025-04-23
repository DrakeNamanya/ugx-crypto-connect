
export async function sendOtp(phone: string, code: string): Promise<boolean> {
  try {
    // Format the phone number to include the country code if it doesn't already
    const formattedPhone = phone.startsWith('+') 
      ? phone 
      : phone.startsWith('0') 
        ? '+256' + phone.substring(1) 
        : phone;

    console.log('Sending OTP to:', formattedPhone, 'Code:', code);

    // Since we're using the provided Twilio credentials, we'll make a request to our backend
    const response = await fetch('/api/v1/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: formattedPhone,
        code: code,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('OTP sent successfully:', data);
    return true;
  } catch (err) {
    console.error('OTP failed:', err);
    return false;
  }
}
