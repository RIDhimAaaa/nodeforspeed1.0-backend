from . import db, bcrypt
from datetime import datetime, timedelta
from flask_login import UserMixin
import enum

class NoteStatus(enum.Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"
    REVIVED = "revived"

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

class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Decay system fields
    decay_minutes = db.Column(db.Integer, nullable=False, default=1440)  # 24 hours default
    original_decay_minutes = db.Column(db.Integer, nullable=False, default=1440)  # Store original decay time
    last_revised = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    status = db.Column(db.Enum(NoteStatus), default=NoteStatus.ACTIVE, nullable=False)
    
    # Penalty tracking fields
    wrong_answers_count = db.Column(db.Integer, nullable=False, default=0)
    penalty_applied = db.Column(db.Boolean, nullable=False, default=False)
    
    # AI revision fields
    ai_summary = db.Column(db.Text)
    ai_questions = db.Column(db.JSON)  # Store array of questions
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    archived_at = db.Column(db.DateTime)
    revived_at = db.Column(db.DateTime)
    
    # Relationship
    user = db.relationship('User', backref=db.backref('notes', lazy=True))
    
    @property
    def expires_at(self):
        return self.last_revised + timedelta(minutes=self.decay_minutes)
    
    @property
    def is_expired(self):
        return datetime.utcnow() > self.expires_at
    
    @property
    def time_remaining(self):
        if self.is_expired:
            return timedelta(0)
        return self.expires_at - datetime.utcnow()
    
    def archive(self):
        self.status = NoteStatus.ARCHIVED
        self.archived_at = datetime.utcnow()
    
    def revive(self):
        self.status = NoteStatus.REVIVED
        self.revived_at = datetime.utcnow()
        self.last_revised = datetime.utcnow()
        # Reset penalty when revived successfully
        self.wrong_answers_count = 0
        self.penalty_applied = False
        self.decay_minutes = self.original_decay_minutes
    
    def apply_wrong_answer_penalty(self):
        """Apply penalty for wrong answer - reduce decay time proportionally"""
        self.wrong_answers_count += 1
        
        # Calculate penalty: reduce decay time by 12.5% per wrong answer (max 3 penalties = 62.5% reduction)
        penalty_percentage = min(0.125 * self.wrong_answers_count, 0.625)  # Max 62.5% reduction
        new_decay_minutes = int(self.original_decay_minutes * (1 - penalty_percentage))
        
        # Minimum decay time should be at least 30 minutes
        self.decay_minutes = max(new_decay_minutes, 30)
        self.penalty_applied = True
        
        return {
            'wrong_answers_count': self.wrong_answers_count,
            'penalty_percentage': penalty_percentage * 100,
            'new_decay_minutes': self.decay_minutes,
            'original_decay_minutes': self.original_decay_minutes
        }
    
    def reset_penalties(self):
        """Reset all penalties and restore original decay time"""
        self.wrong_answers_count = 0
        self.penalty_applied = False
        self.decay_minutes = self.original_decay_minutes
    
    def touch(self):
        """Update last_revised to current time"""
        self.last_revised = datetime.utcnow()
    
    def to_dict(self):
        penalty_percentage = 0
        if self.penalty_applied and self.original_decay_minutes > 0:
            penalty_percentage = round(((self.original_decay_minutes - self.decay_minutes) / self.original_decay_minutes) * 100, 1)
        
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'decay_minutes': self.decay_minutes,
            'original_decay_minutes': self.original_decay_minutes,
            'last_revised': self.last_revised.isoformat(),
            'status': self.status.value,
            'expires_at': self.expires_at.isoformat(),
            'time_remaining_seconds': int(self.time_remaining.total_seconds()),
            'is_expired': self.is_expired,
            'ai_summary': self.ai_summary,
            'ai_questions': self.ai_questions,
            'wrong_answers_count': self.wrong_answers_count,
            'penalty_applied': self.penalty_applied,
            'penalty_percentage': penalty_percentage,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'archived_at': self.archived_at.isoformat() if self.archived_at else None,
            'revived_at': self.revived_at.isoformat() if self.revived_at else None
        }