from itsdangerous import URLSafeTimedSerializer
from flask import current_app
from flask_mail import Message
from . import mail

def generate_confirmation_token(email):
    """Generates a secure, timed token."""
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    return serializer.dumps(email, salt=current_app.config['SECURITY_PASSWORD_SALT'])

def confirm_token(token, expiration=3600):
    """Confirms a token and returns the email if valid."""
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    try:
        email = serializer.loads(
            token,
            salt=current_app.config['SECURITY_PASSWORD_SALT'],
            max_age=expiration
        )
        return email
    except Exception:
        return False

def send_email(to, subject, html_body):
    """Helper function to send an email."""
    msg = Message(
        subject,
        recipients=[to],
        html=html_body,
        sender=current_app.config['MAIL_DEFAULT_SENDER']
    )
    mail.send(msg)