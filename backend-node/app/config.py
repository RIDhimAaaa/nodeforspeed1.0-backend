import os
from dotenv import load_dotenv
from datetime import timedelta  

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "secret-key")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URI", "sqlite:///site.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECURITY_PASSWORD_SALT = os.getenv("SECURITY_PASSWORD_SALT", "my-secret-salt")


    MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.googlemail.com')
    MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'true').lower() in ['true', 'on', '1']
    MAIL_USERNAME = os.getenv('MAIL_USERNAME', 'your-email@example.com')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD', 'your-email-password')
    MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER', 'noreply@example.com')

    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'

    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", SECRET_KEY)
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=60)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)
    JWT_TOKEN_LOCATION = ["headers"]
    JWT_HEADER_NAME = "Authorization"
    JWT_HEADER_TYPE = "Bearer"

    # Gemini AI Configuration
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    
    # Note decay settings
    DEFAULT_DECAY_MINUTES = 1440  # 24 hours
    MAX_DECAY_MINUTES = 10080     # 1 week
    MIN_DECAY_MINUTES = 1         # 1 minute
    
    # Penalty system settings
    PENALTY_PERCENTAGE_PER_WRONG_ANSWER = 0.125  # 12.5% reduction per wrong answer
    MAX_PENALTY_PERCENTAGE = 0.625  # Maximum 62.5% reduction
    MIN_DECAY_AFTER_PENALTY = 30  # Minimum 30 minutes even with max penalties
