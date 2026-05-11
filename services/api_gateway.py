# services/api_gateway.py
from flask import Flask, request, jsonify
from modules.phishing_detector import model as phishing_module

app = Flask(__name__)

@app.route("/check_url", methods=["POST"])
def check_url():
    url = request.json['url']
    result = phishing_module.predict([url])
    return jsonify({"url": url, "prediction": int(result[0])})

if __name__ == "__main__":
    # Use a different port to avoid conflict with dashboard/backend/app.py (also :5000)
    app.run(port=5002)
