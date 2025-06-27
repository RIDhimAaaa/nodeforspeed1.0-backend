from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    """Welcome endpoint"""
    return jsonify({
        'message': 'Welcome to Flask Auth API',
        'version': '1.0.0',
        'endpoints': {
            'auth': {
                'signup': '/auth/signup',
                'login': '/auth/login',
                'verify-email': '/auth/verify-email',
                'resend-verification': '/auth/resend-verification',
                'forgot-password': '/auth/forgot-password',
                'reset-password': '/auth/reset-password',
                'change-password': '/auth/change-password',
                'refresh': '/auth/refresh',
                'profile': '/auth/profile',
                'logout': '/auth/logout'
            },
            'main': {
                'health': '/health',
                'protected': '/protected'
            }
        }
    }), 200

@main_bp.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': '2025-06-27T00:00:00Z'
    }), 200

@main_bp.route('/protected')
@jwt_required()
def protected():
    """Protected endpoint example"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'message': f'Hello {user.first_name}! This is a protected endpoint.',
        'user_id': current_user_id,
        'access_granted': True
    }), 200
