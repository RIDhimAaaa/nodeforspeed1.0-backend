from . import db, bcrypt
from datetime import datetime
from flask_login import UserMixin

# Inherit from UserMixin to integrate with Flask-Login
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False) # Bcrypt hash is 60 chars, 128 is safe
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # New field for email verification status
    is_verified = db.Column(db.Boolean, nullable=False, default=False)

    def set_password(self, password):
        """Hashes the password using Bcrypt."""
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        """Checks the password against the stored Bcrypt hash."""
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def __repr__(self):
        return f'<User {self.username}>'