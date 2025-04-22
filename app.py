
from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
import time
import random
import string

# Twilio integration
from twilio.rest import Client

# Load environment variables or use provided credentials (for demo ONLY)
load_dotenv()
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "AC1a0a6aba823fa1020e2426f99f23336a")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "077bb4af35e577cff2fd4f1122f73508")
TWILIO_FROM_PHONE = os.getenv("TWILIO_FROM_PHONE", "+15056057194")

app = Flask(__name__)

# Mock database
users = []
transactions = []
pending_otps = {}  # phone: {code, created_at}

def generate_reference():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))

# --- OTP HANDLING ---

def generate_otp():
    return ''.join([str(random.randint(0, 9)) for _ in range(6)])

@app.route('/api/v1/send-otp', methods=['POST'])
def send_otp():
    data = request.json
    phone = data.get("phone")
    if not phone:
        return jsonify({'success': False, 'message': 'Phone number required'}), 400

    # Generate OTP code
    otp = generate_otp()
    pending_otps[phone] = {
        "code": otp,
        "created_at": time.time()
    }

    # Send OTP via Twilio
    try:
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        message = client.messages.create(
            body=f"Your UGXchange verification code is: {otp}",
            from_=TWILIO_FROM_PHONE,
            to=phone if phone.startswith('+') else "+256" + phone.lstrip('0')
        )
        return jsonify({'success': True, 'message': 'Verification code sent'})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Twilio error: {str(e)}'}), 500

@app.route('/api/v1/verify-otp', methods=['POST'])
def verify_otp():
    data = request.json
    phone = data.get("phone")
    code = data.get("code")
    record = pending_otps.get(phone)
    if not record:
        return jsonify({'success': False, 'message': 'No OTP sent for this phone'})
    if time.time() - record['created_at'] > 300:  # Expire after 5 min
        return jsonify({'success': False, 'message': 'Verification code expired'})
    if record['code'] != code:
        return jsonify({'success': False, 'message': 'Invalid verification code'})
    # Success! Remove OTP
    del pending_otps[phone]
    return jsonify({'success': True, 'message': 'Phone verified'})

# --- Existing endpoints ---
@app.route('/api/v1/rates', methods=['GET'])
def get_rates():
    return jsonify({
        'buy': 3700,
        'sell': 3650
    })

@app.route('/api/v1/users/register', methods=['POST'])
def register_user():
    data = request.json
    users.append({
        'id': len(users) + 1,
        'fullName': data.get('fullName'),
        'email': data.get('email'),
        'phone': data.get('phone'),
        'created_at': time.time()
    })
    return jsonify({'success': True, 'message': 'User registered successfully'})

@app.route('/api/v1/deposit/mobile-money', methods=['POST'])
def deposit_mobile_money():
    data = request.json
    transaction = {
        'id': len(transactions) + 1,
        'type': 'deposit',
        'method': f"{data.get('provider')} Mobile Money",
        'amount': data.get('amount'),
        'phone': data.get('phoneNumber'),
        'reference': generate_reference(),
        'status': 'pending',
        'created_at': time.time()
    }
    transactions.append(transaction)
    return jsonify({
        'success': True,
        'reference': transaction['reference'],
        'message': 'Deposit request initiated'
    })

@app.route('/api/v1/withdraw/mobile-money', methods=['POST'])
def withdraw_mobile_money():
    data = request.json
    transaction = {
        'id': len(transactions) + 1,
        'type': 'withdrawal',
        'method': f"{data.get('provider')} Mobile Money",
        'amount': data.get('amount'),
        'phone': data.get('phoneNumber'),
        'reference': generate_reference(),
        'status': 'pending',
        'created_at': time.time()
    }
    transactions.append(transaction)
    return jsonify({
        'success': True,
        'reference': transaction['reference'],
        'message': 'Withdrawal request initiated'
    })

@app.route('/api/v1/crypto/transfer', methods=['POST'])
def transfer_crypto():
    data = request.json
    transaction = {
        'id': len(transactions) + 1,
        'type': 'transfer',
        'asset': data.get('asset'),
        'amount': data.get('amount'),
        'address': data.get('walletAddress'),
        'txId': f"TX{int(time.time())}",
        'status': 'pending',
        'created_at': time.time()
    }
    transactions.append(transaction)
    return jsonify({
        'success': True,
        'txId': transaction['txId'],
        'message': 'Transfer initiated'
    })

@app.route('/api/v1/transactions', methods=['GET'])
def get_transactions():
    return jsonify({
        'success': True,
        'transactions': transactions
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
