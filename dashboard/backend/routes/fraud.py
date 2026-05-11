from flask import Blueprint, request, jsonify
import random
import numpy as np
from state import MODELS, GLOBAL_STATS, add_alert

bp = Blueprint('fraud', __name__)

@bp.route('/api/fraud/predict', methods=['POST'])
def fraud_predict():
    data = request.get_json(force=True)
    transactions = data.get('transactions', [])
    if not transactions:
        txn = {
            'amount': data.get('amount', 100),
            'merchant_category': data.get('merchant_category', 0),
            'hour': data.get('hour', 12),
            'distance_from_home': data.get('distance_from_home', 5),
            'foreign_transaction': data.get('foreign_transaction', 0),
            'online_order': data.get('online_order', 0),
            'high_value': data.get('high_value', 0),
            'time_since_last': data.get('time_since_last', 24),
            'velocity': data.get('velocity', 1),
            'card_present': data.get('card_present', 1),
        }
        transactions = [txn]

    mdl = MODELS['fraud']['model']
    results = []
    for txn in transactions:
        feat = [
            float(txn.get('amount', 100)),
            float(txn.get('merchant_category', 0)),
            float(txn.get('hour', 12)),
            float(txn.get('distance_from_home', 5)),
            float(txn.get('foreign_transaction', 0)),
            float(txn.get('online_order', 0)),
            float(txn.get('high_value', 0)),
            float(txn.get('time_since_last', 24)),
            float(txn.get('velocity', 1)),
            float(txn.get('card_present', 1)),
        ]
        X = np.array(feat).reshape(1, -1)
        pred = int(mdl.predict(X)[0])
        prob = float(mdl.predict_proba(X)[0][1])
        
        amount_val = float(txn.get('amount', 0))
        dist_val = float(txn.get('distance_from_home', 0))
        hour_val = int(txn.get('hour', 12))
        
        is_fraud_heuristic = False
        if amount_val > 5000:
            is_fraud_heuristic = True
        elif amount_val > 1000 and dist_val > 100:
            is_fraud_heuristic = True
        elif amount_val > 500 and (hour_val < 5 or hour_val > 23):
            is_fraud_heuristic = True
            
        if is_fraud_heuristic:
            pred = 1
            prob = max(prob, 0.90)
            add_alert("Fraud Detection", f"Fraudulent Transaction: ${amount_val} at {hour_val}:00", "Critical")
        else:
            # Let ML model handle it, avoid overly aggressive false negative overriding
            if prob >= 0.5:
                pred = 1
            else:
                pred = 0
            
        results.append({
            'transaction': txn,
            'prediction': pred,
            'label': 'FRAUD' if pred == 1 else 'LEGITIMATE',
            'fraud_probability': round(prob * 100, 2),
            'risk_score': round(prob * 100, 2)
        })
        
    if transactions:
        threat_ratio = sum(r['prediction'] for r in results) / len(transactions)
        GLOBAL_STATS['fraud'] = GLOBAL_STATS['fraud'] * 0.5 + threat_ratio * 0.5

    return jsonify({'results': results, 'total': len(results), 'fraud_count': sum(r['prediction'] for r in results)})
