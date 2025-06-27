from flask import Flask
from flask_jwt_extended import JWTManager
from datetime import timedelta

app = Flask(__name__)

# JWT Configuration
app.config['JWT_SECRET_KEY'] = 'hackathon-secret-2025'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=3)

# Initialize JWT
jwt = JWTManager(app)

# Import and register auth routes
from app.auth import auth_bp
app.register_blueprint(auth_bp)

@app.route('/')
def hello():
    return {'message': 'Flask app is running!'}