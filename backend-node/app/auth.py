from flask import Blueprint, request, jsonify, url_for
from .models import User
from . import db, bcrypt, jwt
from .utils import generate_confirmation_token, confirm_token, send_email
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, create_refresh_token

auth_bp = Blueprint('auth', __name__)

# JWT error handler
@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({
        "msg": "Invalid token",
        "error": str(error)
    }), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({
        "msg": "Missing Bearer token. Expected 'Authorization: Bearer <JWT>'",
        "error": str(error)
    }), 401

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"error": "Missing required fields"}), 400

    if User.query.filter((User.email == email) | (User.username == username)).first():
        return jsonify({"error": "Email or username already exists"}), 409

    new_user = User(username=username, email=email)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    token = generate_confirmation_token(new_user.email)
    verify_url = url_for('auth.verify_email', token=token, _external=True)
    html_body = f"<p>Welcome! Thanks for signing up. Please follow this link to activate your account:</p><p><a href='{verify_url}'>{verify_url}</a></p>"
    send_email(new_user.email, "Please confirm your email", html_body)

    return jsonify({"message": "User created. Please check your email to verify your account."}), 201


@auth_bp.route('/verify-email/<token>', methods=['GET'])
def verify_email(token):
    try:
        email = confirm_token(token)
    except:
        return jsonify({"error": "The confirmation link is invalid or has expired."}), 400

    user = User.query.filter_by(email=email).first_or_404()

    if user.is_verified:
        return jsonify({"message": "Account already verified. Please login."}), 200
    else:
        user.is_verified = True
        db.session.commit()
        return jsonify({"message": "You have successfully verified your account. Thanks!"}), 200


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401

    if not user.is_verified:
        return jsonify({"error": "Account not verified. Please check your email."}), 403

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {"id": user.id, "username": user.username}
    }), 200

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    try:
        current_user = get_jwt_identity()
        if not current_user:
            return jsonify({"msg": "Invalid refresh token"}), 401
            
        new_access_token = create_access_token(identity=current_user)
        return jsonify({
            "access_token": new_access_token,
            "msg": "New access token created successfully"
        }), 200
    except Exception as e:
        return jsonify({
            "msg": "Error refreshing token",
            "error": str(e)
        }), 401


@auth_bp.route('/reset-password-request', methods=['GET'])
def reset_password_request():
    data = request.get_json()
    email = data.get('email')
    user = User.query.filter_by(email=email).first()

    if user:
        token = generate_confirmation_token(user.email)
        reset_url = f"http://localhost:5000/api/auth/reset-password/{token}"
        html_body = f"<p>You requested a password reset. Click the link below:</p><p><a href='{reset_url}'>{reset_url}</a></p>"
        send_email(user.email, "Password Reset Request", html_body)

    return jsonify({"message": "If an account with that email exists, a password reset link has been sent."}), 200


@auth_bp.route('/reset-password/<token>', methods=['GET', 'POST'])
def reset_password(token):
    try:
        email = confirm_token(token)
    except:
        return jsonify({"error": "The reset link is invalid or has expired."}), 400

    user = User.query.filter_by(email=email).first_or_404()

    if request.method == 'GET':
        return jsonify({"message": "Reset token is valid. Please proceed with setting your new password."}), 200
    
    new_password = request.get_json().get('password')
    if not new_password:
        return jsonify({"error": "Password is required"}), 400

    user.set_password(new_password)
    db.session.commit()
    return jsonify({"message": "Your password has been reset successfully."}), 200



