import requests

base_url = "http://127.0.0.1:5005"

endpoints = [
    ("/api/phishing/predict", {"urls": ["http://test.com", "random string", ""]}),
    ("/api/malware/predict", {"file_hex": "abcd"}),
    ("/api/ids/predict", {"log": "hello test 123 456"}),
    ("/api/behavior/predict", {"events": [{"login_hour": 2, "session_duration": 600, "failed_logins": 8, "pages_visited": 350, "data_transferred": 15000}]}),
    ("/api/email/predict", {"emails": ["hello test", "URGENT WINNER", ""]}),
    ("/api/fraud/predict", {"transactions": [{"amount": 5000, "distance_from_home": 500, "hour": 2}]}),
    ("/api/adversarial/analyze", {"text": "URGENT verify account", "epsilon": 0.25, "attack_type": "FGSM"}),
    ("/api/adversarial/analyze", {"text": "URGENT verify account", "epsilon": 0.1, "attack_type": "DeepWordBug"}),
    ("/api/adversarial/analyze", {"text": "URGENT verify account", "epsilon": 0.1, "attack_type": "TextBugger"}),
]

for endpoint, payload in endpoints:
    try:
        res = requests.post(base_url + endpoint, json=payload)
        print(f"{endpoint} -> {res.status_code}")
        if res.status_code != 200:
            print(res.text)
    except Exception as e:
        print(f"{endpoint}: Exception {e}")
