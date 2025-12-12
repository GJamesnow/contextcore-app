import os
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
CORS(app)

# --- DATABASE CONFIGURATION ---
# This connects to the Render PostgreSQL database
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///local.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# --- DATABASE MODELS ---
class Market(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    lookup_key = db.Column(db.String(50), unique=True) # e.g. "stony", "whyte"
    name = db.Column(db.String(100))
    population = db.Column(db.Integer)
    avg_income = db.Column(db.Integer)
    score = db.Column(db.Integer)
    status = db.Column(db.String(50))
    # We store competitors as a simple pipe-separated string for MVP simplicity
    # e.g. "Freson Bros|Grocery|0.2 km,Tim Hortons|Coffee|0.4 km"
    competitors_raw = db.Column(db.Text)

# Create tables within the application context
with app.app_context():
    db.create_all()

# --- ROUTES ---

@app.route('/')
def home():
    return send_from_directory('.', 'dashboard.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    # Simple logic to find the keyword in the address
    addr = data.get('address', '').lower()
    
    # Default match
    market_data = Market.query.filter_by(lookup_key='default').first()
    
    # Try to find a specific match
    if "stony" in addr or "4300" in addr:
        found = Market.query.filter_by(lookup_key='stony').first()
        if found: market_data = found
    elif "leduc" in addr:
        found = Market.query.filter_by(lookup_key='leduc').first()
        if found: market_data = found
        
    # Format competitors from the raw string
    radar_list = []
    if market_data and market_data.competitors_raw:
        for comp in market_data.competitors_raw.split(','):
            parts = comp.split('|')
            if len(parts) == 3:
                radar_list.append({"name": parts[0], "type": parts[1], "dist": parts[2]})

    # Fallback if DB is empty
    if not market_data:
        return jsonify({"error": "No data found. Did you run /seed?"}), 500

    return jsonify({
        "loc": {"address": addr.title()},
        "demo": {
            "pop": market_data.population, 
            "inc": market_data.avg_income, 
            "market": market_data.name
        },
        "radar": {"list": radar_list, "radius": 3.0},
        "fit": {
            "score": market_data.score, 
            "status": market_data.status, 
            "notes": ["Database Record Loaded"]
        }
    })

# --- SEED ROUTE (RUN THIS ONCE) ---
@app.route('/seed')
def seed_data():
    # Clear existing data to avoid duplicates
    db.session.query(Market).delete()
    
    # 1. Stony Plain
    stony = Market(
        lookup_key='stony',
        name="Stony Plain (Growth)",
        population=18000,
        avg_income=118000,
        score=82,
        status="Strong Opportunity",
        competitors_raw="Freson Bros|Grocery|0.2 km,Tim Hortons|Coffee|0.4 km"
    )
    
    # 2. Leduc
    leduc = Market(
        lookup_key='leduc',
        name="Leduc Common",
        population=36000,
        avg_income=98000,
        score=75,
        status="Moderate Growth",
        competitors_raw="Canadian Tire|Big Box|0.5 km,Walmart|Big Box|0.7 km"
    )
    
    # 3. Default
    default = Market(
        lookup_key='default',
        name="General Market Area",
        population=50000,
        avg_income=80000,
        score=60,
        status="Review Needed",
        competitors_raw="Generic Store|Retail|1.0 km"
    )
    
    db.session.add_all([stony, leduc, default])
    db.session.commit()
    return "Database seeded successfully! You can now use the app."

if __name__ == '__main__':
    app.run()
