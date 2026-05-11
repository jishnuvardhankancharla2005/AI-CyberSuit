import requests

base_url = "http://127.0.0.1:5005"

endpoints = [
    ("/api/phishing/predict", {"urls": ["http://test.com"]}),
    ("/api/malware/predict", {"features": [0.1]*20}),
    ("/api/ids/predict", {"features": [0.1]*12}),
    ("/api/behavior/predict", {"events": [{"login_hour": 12}]}),
    ("/api/email/predict", {"emails": ["hello test"]}),
    ("/api/fraud/predict", {"transactions": [{"amount": 100}]}),
    ("/api/adversarial/analyze", {"text": "hello test", "epsilon": 0.1}),
    ("/api/deepfake/predict", {"media_url": "test.mp4"}),
    ("/api/vulnerability/scan", {"code": "print('hello')"})
]

for endpoint, payload in endpoints:
    try:
        res = requests.post(base_url + endpoint, json=payload)
        print(f"{endpoint}: {res.status_code}")
        if res.status_code != 200:
            print(res.text)
    except Exception as e:
        print(f"{endpoint}: Exception {e}")
