# services/user_behavior_service.py
from flask import Flask, request, jsonify
from modules.user_behavior.model import iso_forest, scaler

app = Flask(__name__)

@app.route("/detect_behavior", methods=["POST"])
def detect_behavior():
    data = request.json['features']  # list of [login_time, session_duration, device_id]
    scaled = scaler.transform([data])
    iso_pred = iso_forest.predict(scaled)[0]
    # For demo, only using Isolation Forest
    return jsonify({"features": data, "anomaly": int(iso_pred == -1)})

if __name__ == "__main__":
    app.run(port=5001)