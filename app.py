
from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
import time
import random
import string

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Mock database
users = []
transactions = []

# Helper functions
def generate_reference():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))

@app.route('/api/v1/rates', methods=['GET'])
def get_rates():
    # In a real app, this would fetch from Binance API
    return jsonify({
        'buy': 3700,  # UGX per 1 USDT when buying USDT
        'sell': 3650  # UGX per 1 USDT when selling USDT
    })

@app.route('/api/v1/users/register', methods=['POST'])
def register_user():
    data = request.json
    # In a real app, this would validate and store in a database
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
    
    # Simulate MTN Mobile Money API integration
    if data.get('provider') == 'MTN':
        # In a real app, would use MTN_CLIENT_ID and MTN_SECRET
        pass
    
    # Simulate Airtel Money API integration
    elif data.get('provider') == 'AIRTEL':
        # In a real app, would use AIRTEL_API_KEY
        pass
    
    # Create transaction record
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
    
    # In a real app, this would initiate the actual payment request
    return jsonify({
        'success': True,
        'reference': transaction['reference'],
        'message': 'Deposit request initiated'
    })

@app.route('/api/v1/withdraw/mobile-money', methods=['POST'])
def withdraw_mobile_money():
    data = request.json
    
    # Create transaction record
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
    
    # In a real app, this would initiate the actual withdrawal
    return jsonify({
        'success': True,
        'reference': transaction['reference'],
        'message': 'Withdrawal request initiated'
    })

@app.route('/api/v1/crypto/transfer', methods=['POST'])
def transfer_crypto():
    data = request.json
    
    # Create transaction record
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
    
    # In a real app, this would use BINANCE_API_KEY and BINANCE_SECRET_KEY
    return jsonify({
        'success': True,
        'txId': transaction['txId'],
        'message': 'Transfer initiated'
    })

@app.route('/api/v1/transactions', methods=['GET'])
def get_transactions():
    # In a real app, this would filter by user ID
    return jsonify({
        'success': True,
        'transactions': transactions
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
