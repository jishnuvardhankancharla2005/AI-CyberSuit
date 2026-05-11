import requests

emails = [
    "Congratulations! You won $1000 click here now",
    "Hey John, can we schedule a meeting for tomorrow?",
    "URGENT: Your account has been compromised. Verify your wallet immediately.",
    "Get free crypto now!"
]

res = requests.post("http://localhost:5005/api/email/predict", json={"emails": emails})
print(res.json())
