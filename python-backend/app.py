from flask import Flask, request, jsonify
from flask_cors import CORS
from database import init_db, get_db_connection
from auth import create_user, verify_user, verify_token
import os

app = Flask(__name__)
CORS(app)

init_db()

@app.route('/api/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        if not all([username, email, password]):
            return jsonify({'success': False, 'message': 'All fields are required'})
        
        result = create_user(username, email, password)
        return jsonify(result)
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not all([email, password]):
            return jsonify({'success': False, 'message': 'Email and password are required'})
        
        result = verify_user(email, password)
        return jsonify(result)
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/verify', methods=['GET'])
def verify():
    try:
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'success': False, 'message': 'No token provided'})
        
        if token.startswith('Bearer '):
            token = token[7:]
        
        result = verify_token(token)
        return jsonify(result)
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

if __name__ == '__main__':
    app.run(host='localhost', port=5000, debug=False)