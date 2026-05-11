import os
import sys

# Ensure backend package resolution
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from flask_cors import CORS
from models import boot_models

# Import Route Blueprints
from routes.phishing import bp as phishing_bp
from routes.malware import bp as malware_bp
from routes.ids import bp as ids_bp
from routes.behavior import bp as behavior_bp
from routes.email import bp as email_bp
from routes.fraud import bp as fraud_bp
from routes.system import bp as system_bp

app = Flask(__name__)
CORS(app)

# Train ML Models on Boot
boot_models()

# Register API Routes
app.register_blueprint(phishing_bp)
app.register_blueprint(malware_bp)
app.register_blueprint(ids_bp)
app.register_blueprint(behavior_bp)
app.register_blueprint(email_bp)
app.register_blueprint(fraud_bp)
app.register_blueprint(system_bp)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5005, debug=True)