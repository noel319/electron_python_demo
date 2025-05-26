import bcrypt
import jwt
import sqlite3
from datetime import datetime, timedelta
from database import get_db_connection

SECRET_KEY = 'your-secret-key-change-this-in-production'

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password, password_hash):
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))

def generate_token(user_id):
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(days=1)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def create_user(username, email, password):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if user already exists
        cursor.execute('SELECT * FROM users WHERE email = ? OR username = ?', (email, username))
        if cursor.fetchone():
            conn.close()
            return {'success': False, 'message': 'User already exists'}
        
        # Create new user
        password_hash = hash_password(password)
        cursor.execute(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            (username, email, password_hash)
        )
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        # Generate token
        token = generate_token(user_id)
        
        return {
            'success': True,
            'token': token,
            'user': {
                'id': user_id,
                'username': username,
                'email': email
            }
        }
    except Exception as e:
        return {'success': False, 'message': f'Error creating user: {str(e)}'}

def verify_user(email, password):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            return {'success': False, 'message': 'Invalid email or password'}
        
        if not verify_password(password, user['password_hash']):
            return {'success': False, 'message': 'Invalid email or password'}
        
        token = generate_token(user['id'])
        
        return {
            'success': True,
            'token': token,
            'user': {
                'id': user['id'],
                'username': user['username'],
                'email': user['email']
            }
        }
    except Exception as e:
        return {'success': False, 'message': f'Error verifying user: {str(e)}'}

def verify_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user_id = payload['user_id']
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            return {'success': False, 'message': 'User not found'}
        
        return {
            'success': True,
            'user': {
                'id': user['id'],
                'username': user['username'],
                'email': user['email']
            }
        }
    except jwt.ExpiredSignatureError:
        return {'success': False, 'message': 'Token has expired'}
    except jwt.InvalidTokenError:
        return {'success': False, 'message': 'Invalid token'}
    except Exception as e:
        return {'success': False, 'message': f'Error verifying token: {str(e)}'}