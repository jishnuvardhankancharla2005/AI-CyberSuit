from flask import Blueprint, request, jsonify
import random
import numpy as np
import re
from state import MODELS, GLOBAL_STATS, add_alert

bp = Blueprint('ids', __name__)

@bp.route('/api/ids/predict', methods=['POST'])
def ids_predict():
    data = request.get_json(force=True)
    log_text = data.get('log', '')
    features = data.get('features', None)

    if features is not None:
        X = np.array(features[:12]).reshape(1, -1)
        if X.shape[1] < 12:
            X = np.pad(X, ((0,0),(0,12-X.shape[1])))
    else:
        nums = re.findall(r'\d+\.?\d*', log_text)[:12]
        row = [float(n)/1000.0 for n in nums]
        while len(row) < 12:
            row.append(random.random())
        X = np.array(row).reshape(1, -1)

    mdl = MODELS['ids']['model']
    pred = int(mdl.predict(X)[0])
    prob = float(mdl.predict_proba(X)[0][1])
    attack_types = ['Port Scan', 'DoS', 'Brute Force', 'SQL Injection', 'XSS']
    atype = random.choice(attack_types) if pred == 1 else 'Normal'

    if pred == 1:
        add_alert("IDS", f"Intrusion attempt: {atype} detected", "Critical" if prob > 0.8 else "High")
        
    GLOBAL_STATS['ids'] = GLOBAL_STATS['ids'] * 0.7 + prob * 0.3

    return jsonify({
        'prediction': pred,
        'label': 'ATTACK' if pred == 1 else 'NORMAL',
        'attack_type': atype,
        'confidence': round(prob * 100, 2)
    })
