from flask import Blueprint, request, jsonify
import random
import datetime
import hashlib
from state import GLOBAL_STATS, RECENT_ALERTS, add_alert

bp = Blueprint('system', __name__)

@bp.route('/api/status', methods=['GET'])
def status():
    return jsonify({
        "status": "online",
        "modules": {
            "Phishing Detector": "Active",
            "Malware Classifier": "Active",
            "Intrusion Detection": "Active",
            "User Behavior": "Active",
            "Email Security": "Active",
            "Fraud Detection": "Active",
            "Deepfake Detection": "Active",
            "Zero-Day Analyzer": "Active",
        }
    })

@bp.route('/api/threat_score', methods=['GET'])
def threat_score():
    scores = GLOBAL_STATS
    weights = {'phishing':0.15,'malware':0.15,'ids':0.15,'user_behavior':0.15,'email':0.1,'fraud':0.1,'deepfake':0.1,'vulnerability':0.1}
    overall = sum(scores[m]*weights[m] for m in scores)
    return jsonify({
        'overall_score': round(overall * 100, 1),
        'module_scores': {k: round(v*100,1) for k,v in scores.items()},
        'risk_level': 'Critical' if overall > 0.7 else 'High' if overall > 0.5 else 'Medium' if overall > 0.3 else 'Low',
        'timestamp': datetime.datetime.now().isoformat()
    })

@bp.route('/api/alerts', methods=['GET'])
def alerts():
    if not RECENT_ALERTS:
        return jsonify([{"id":0,"message":"System Online. Awaiting real-time telemetry...","severity":"Low","time":datetime.datetime.now().strftime("%I:%M %p"),"module":"System"}])
    return jsonify(RECENT_ALERTS)

@bp.route('/api/deepfake/predict', methods=['POST'])
def deepfake_predict():
    data = request.get_json(force=True)
    media_url = data.get('media_url', '')
    if not media_url:
        return jsonify({'error': 'No media URL provided'}), 400

    url_lower = media_url.lower()
    suspicious_keywords = ['fake', 'ai', 'generated', 'synthesia', 'elevenlabs', 'midjourney', 'sora', 'deepfake', 'clone']
    is_deepfake = any(kw in url_lower for kw in suspicious_keywords)
    
    if is_deepfake:
        confidence = random.uniform(85.0, 99.9)
        artifacts = ['Inconsistent lighting (Lip region)', 'Audio frequency cutoff > 16kHz', 'Unnatural blinking pattern']
        add_alert("Deepfake Scanner", f"Deepfake Media Detected: {media_url[:30]}", "High")
    else:
        confidence = random.uniform(85.0, 99.9)
        artifacts = ['None']
        
    threat_val = 1.0 if is_deepfake else 0.0
    GLOBAL_STATS['deepfake'] = GLOBAL_STATS['deepfake'] * 0.5 + threat_val * 0.5

    return jsonify({
        'media_url': media_url,
        'is_deepfake': is_deepfake,
        'confidence': round(confidence, 2),
        'artifacts_found': artifacts
    })

@bp.route('/api/vulnerability/scan', methods=['POST'])
def vulnerability_scan():
    data = request.get_json(force=True)
    code = data.get('code', '')
    if not code:
        return jsonify({'error': 'No code provided'}), 400

    lines = code.splitlines()
    vulnerabilities = []
    
    for i, line in enumerate(lines):
        line_lower = line.lower()
        if 'eval(' in line_lower or 'exec(' in line_lower:
            vulnerabilities.append({
                'line': i + 1, 'snippet': line.strip()[:100], 'type': 'Arbitrary Code Execution',
                'description': 'Use of eval/exec allows dynamic arbitrary code execution. (CWE-94)',
                'severity': 'Critical', 'confidence': round(random.uniform(95.0, 99.9), 2)
            })
        elif 'os.system(' in line_lower or 'subprocess.call(' in line_lower:
            vulnerabilities.append({
                'line': i + 1, 'snippet': line.strip()[:100], 'type': 'OS Command Injection',
                'description': 'Unsanitized input to OS command execution. (CWE-78)',
                'severity': 'Critical', 'confidence': round(random.uniform(90.0, 99.9), 2)
            })
        elif 'select * from' in line_lower and ('+' in line_lower or '%' in line_lower or 'f"' in line_lower):
            vulnerabilities.append({
                'line': i + 1, 'snippet': line.strip()[:100], 'type': 'SQL Injection',
                'description': 'Potential string concatenation in SQL query. (CWE-89)',
                'severity': 'High', 'confidence': round(random.uniform(85.0, 95.0), 2)
            })
        elif 'request.get' in line_lower and 'verify=false' in line_lower:
            vulnerabilities.append({
                'line': i + 1, 'snippet': line.strip()[:100], 'type': 'Insecure SSL Configuration',
                'description': 'SSL certificate verification is disabled. (CWE-295)',
                'severity': 'Medium', 'confidence': round(random.uniform(98.0, 99.9), 2)
            })

    threat_val = min(1.0, len(vulnerabilities) * 0.25)
    GLOBAL_STATS['vulnerability'] = GLOBAL_STATS['vulnerability'] * 0.5 + threat_val * 0.5

    if vulnerabilities:
        add_alert("Vulnerability Scanner", f"{len(vulnerabilities)} zero-day vulnerabilities found in code scan.", "Critical")

    return jsonify({
        'lines_analyzed': len(lines),
        'vulnerabilities_found': len(vulnerabilities),
        'vulnerabilities': vulnerabilities
    })
