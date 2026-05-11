from flask import Blueprint, request, jsonify
import numpy as np
from state import MODELS, GLOBAL_STATS, add_alert

bp = Blueprint('behavior', __name__)

@bp.route('/api/behavior/predict', methods=['POST'])
def behavior_predict():
    data = request.get_json(force=True)
    events = data.get('events', [])
    
    if not events or not isinstance(events[0], dict):
        return jsonify({
            'prediction': 0, 'label': 'NORMAL', 'anomaly_score': -1.0, 
            'risk_level': 100, 'severity': 'Low'
        })
        
    ev = events[0]
    hour = int(ev.get('login_hour', 12))
    duration = int(ev.get('session_duration', 30))
    failed = int(ev.get('failed_logins', 0))
    pages = int(ev.get('pages_visited', 5))
    data_transfer = int(ev.get('data_transferred', 100))
    
    # Use the ML model trained on the UEBA dataset
    X = np.array([[hour, duration, failed, pages, data_transfer]])
    mdl = MODELS['user_behavior']['model']
    
    pred = int(mdl.predict(X)[0])
    prob = float(mdl.predict_proba(X)[0][1])
    
    is_anomaly = pred == 1
    
    # The Frontend UI expects `risk_level >= 80` to mean "Normal" (Safety Score)
    calculated_risk = int(prob * 100)
    safety_score = 100 - calculated_risk
    
    # Calculate an anomaly score representing the distance from normal (-1.0 to 1.0)
    anomaly_score = -((calculated_risk / 100.0) * 2 - 1)

    if is_anomaly:
        add_alert("User Behavior", f"Suspicious session behavior detected (Risk: {calculated_risk}/100)", "Medium" if calculated_risk < 75 else "High")

    threat_val = calculated_risk / 100.0
    GLOBAL_STATS['user_behavior'] = GLOBAL_STATS['user_behavior'] * 0.5 + threat_val * 0.5

    return jsonify({
        'prediction': 1 if is_anomaly else 0,
        'label': 'ANOMALY' if is_anomaly else 'NORMAL',
        'anomaly_score': round(anomaly_score, 4),
        'risk_level': safety_score,
        'severity': 'High' if safety_score < 50 else ('Medium' if safety_score < 80 else 'Low')
    })
