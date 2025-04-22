# Create the sendOtp.js file content
send_otp_code = """
import twilio from 'twilio';

const accountSid = import.meta.env.VITE_TWILIO_SID;
const authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
const twilioPhone = import.meta.env.VITE_TWILIO_PHONE;

const client = twilio(accountSid, authToken);

export async function sendOtp(phone, code) {
  try {
    await client.messages.create({
      body: `Your OTP code is: ${code}`,
      from: twilioPhone,
      to: phone,
    });
    console.log('OTP sent successfully');
    return true;
  } catch (err) {
    console.error('OTP failed:', err.message);
    return false;
  }
}
"""

# Define the path to create the new sendOtp.js file
send_otp_path = os.path.join(project_root, 'src', 'services', 'sendOtp.js')

# Write the content to the file
with open(send_otp_path, 'w', encoding='utf-8') as f:
    f.write(send_otp_code)

send_otp_path
