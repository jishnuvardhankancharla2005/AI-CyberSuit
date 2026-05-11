from flask import Flask, request, jsonify
import jwt
import datetime
from functools import wraps

# Secret key for JWT (in production, store securely in env variables)
SECRET_KEY = "supersecretkey"

app = Flask(__name__)

# -----------------------------
# Helper: Token Required Decorator
# -----------------------------
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # JWT passed in headers
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]

        if not token:
            return jsonify({"message": "Token is missing!"}), 401

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user = data['user']
            role = data['role']
        except Exception as e:
            return jsonify({"message": "Token is invalid!", "error": str(e)}), 401

        return f(current_user, role, *args, **kwargs)
    return decorated

# -----------------------------
# Route: User Login
# -----------------------------
@app.route('/login', methods=['POST'])
def login():
    auth = request.json
    username = auth.get("username")
    password = auth.get("password")

    # Demo user validation (replace with DB lookup)
    if username == "admin" and password == "admin123":
        token = jwt.encode({
            'user': username,
            'role': 'admin',
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=2)
        }, SECRET_KEY, algorithm="HS256")
        return jsonify({"token": token})

    elif username == "user" and password == "user123":
        token = jwt.encode({
            'user': username,
            'role': 'user',
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=2)
        }, SECRET_KEY, algorithm="HS256")
        return jsonify({"token": token})

    return jsonify({"message": "Invalid credentials"}), 401

# -----------------------------
# Route: Protected Resource
# -----------------------------
@app.route('/secure-data', methods=['GET'])
@token_required
def secure_data(current_user, role):
    if role == "admin":
        return jsonify({"message": f"Welcome {current_user}, you have ADMIN access."})
    else:
        return jsonify({"message": f"Welcome {current_user}, you have USER access."})

# -----------------------------
# Route