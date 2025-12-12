from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)

@app.route('/')
def home(): 
    return send_from_directory('.', 'dashboard.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    desc = data.get('desc', 'Retail').lower()
    addr = data.get('address', '').lower()
    
    # 1. HARDCODED "REAL-FEEL" DATA
    income = 92000; market = "Edmonton General"; pop = 100000
    if "stony" in addr or "4300" in addr: income = 118000; market = "Stony Plain (Growth)"; pop = 18000
    elif "leduc" in addr: income = 98000; market = "Leduc Common"; pop = 36000
    elif "whyte" in addr: income = 85000; market = "Whyte Ave (High Density)"; pop = 45000

    # 2. COMPETITORS
    radar_list = []
    if "stony" in addr or "4300" in addr: radar_list = [{"name": "Freson Bros", "type": "Grocery", "dist": "0.2 km"}, {"name": "Tim Hortons", "type": "Coffee", "dist": "0.4 km"}]
    elif "whyte" in addr: radar_list = [{"name": "Block 1912", "type": "Cafe", "dist": "0.1 km"}, {"name": "Hudson's Pub", "type": "Bar", "dist": "0.1 km"}]
    elif "leduc" in addr: radar_list = [{"name": "Canadian Tire", "type": "Big Box", "dist": "0.5 km"}, {"name": "Walmart", "type": "Big Box", "dist": "0.7 km"}]
    else: radar_list = [{"name": "Generic Store A", "type": "Retail", "dist": "0.5 km"}, {"name": "Generic Store B", "type": "Retail", "dist": "1.2 km"}]
    
    # 3. SCORE
    score = 82; notes = ["Strong demographic fit."]; 
    if income > 100000: score += 10; notes.append("High Income Zone.")
    
    return jsonify({
        "loc": {"address": addr.title()},
        "demo": {"pop": pop, "inc": income, "market": market},
        "radar": {"list": radar_list, "radius": 3.0},
        "fit": {"score": score, "status": "Strong Opportunity", "notes": notes}
    })

# --- DEPLOYMENT ROUTES ---
@app.route('/requirements.txt')
def serve_requirements(): return "flask\nFlask-CORS\ngunicorn"

@app.route('/Procfile')
def serve_procfile(): return "web: gunicorn app:app"

if __name__ == '__main__':
    print("🚀 CONTEXTCORE GOLD MASTER RUNNING...")
    app.run(host='0.0.0.0', debug=True)