import datetime

MODELS = {}

GLOBAL_STATS = {
    'phishing': 0.0,
    'malware': 0.0,
    'ids': 0.0,
    'user_behavior': 0.0,
    'email': 0.0,
    'fraud': 0.0,
    'deepfake': 0.0,
    'vulnerability': 0.0
}

RECENT_ALERTS = []
ALERT_ID_COUNTER = 1

def add_alert(module, message, severity):
    global ALERT_ID_COUNTER
    RECENT_ALERTS.insert(0, {
        "id": ALERT_ID_COUNTER,
        "message": message,
        "severity": severity,
        "time": datetime.datetime.now().strftime("%I:%M %p"),
        "module": module
    })
    ALERT_ID_COUNTER += 1
    if len(RECENT_ALERTS) > 20:
        RECENT_ALERTS.pop()
