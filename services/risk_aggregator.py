# services/risk_aggregator.py
def aggregate_scores(results):
    weights = {"phishing":0.2, "malware":0.2, "ids":0.2, "user_behavior":0.2, "email":0.1, "fraud":0.1}
    score = sum(results[m]*weights[m] for m in results)
    return round(score*100, 2)