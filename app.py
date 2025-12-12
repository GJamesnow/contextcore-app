import os
import requests
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy # Keep this, even if not fully used yet

# --- APP SETUP ---
app = Flask(__name__)
CORS(app)

# Use SQLite for safety/self-healing, even if we move to Postgres later
try:
    os.makedirs(app.instance_path)
except OSError:
    pass

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(app.instance_path, 'contextcore_v3.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# --- CONFIGURATION & FALLBACK DATA ---
GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY')

# Define a simple "Market" model just to hold the self-healing data
class Market(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    lookup_key = db.Column(db.String(50), unique=True)
    name = db.Column(db.String(100))
    population = db.Column(db.Integer)
    avg_income = db.Column(db.Integer)
    score = db.Column(db.Integer)
    lat = db.Column(db.Float)
    lng = db.Column(db.Float)

# Self-Healing Function (Ensures a fallback exists)
def seed_database_internal():
    # Only create tables if they don't exist
    with app.app_context():
        db.create_all()
        if Market.query.first(): 
            return # Already seeded
        
        # Hardcoded demo data (Stony Plain)
        stony = Market(
            lookup_key='stony',
            name="Stony Plain (Growth)",
            population=24000,
            avg_income=125000,
            score=88,
            lat=53.5285, lng=-114.0107
        )
        
        # Competitors (Required for the frontend list)
        global STONY_COMPETITORS
        STONY_COMPETITORS = [
            {"name": "Freson Bros", "type": "Grocery", "dist": "0.4km", "lat": 53.5290, "lng": -114.0120},
            {"name": "Tim Hortons", "type": "Coffee", "dist": "0.6km", "lat": 53.5265, "lng": -114.0040},
            {"name": "Rexall", "type": "Pharmacy", "dist": "0.8km", "lat": 53.5300, "lng": -114.0150},
        ]
        
        db.session.add(stony)
        db.session.commit()
        print("--- DATABASE AUTO-SEEDED with fallback data ---")

# --- ROUTES ---

@app.route('/')
def home():
    return app.send_static_file('dashboard.html') # Serve the UI

@app.route('/analyze', methods=['POST'])
def analyze():
    # Crucial Step: Run self-healing before every request to ensure data exists
    seed_database_internal() 
    
    data = request.json
    address = data.get('address', '').lower()
    
    # --- 1. LIVE DATA ATTEMPT ---
    # Try to connect to Google if the key exists
    if GOOGLE_API_KEY and address and address != '4300 south park dr, stony plain':
        try:
            # 1a. GEOCODING 
            geo_url = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={GOOGLE_API_KEY}"
            geo_res = requests.get(geo_url).json()
            
            if geo_res.get('results'):
                location = geo_res['results'][0]['geometry']['location']
                lat, lng = location['lat'], location['lng']
                
                # 1b. COMPETITOR SCAN 
                places_url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={lat},{lng}&radius=2000&type=store&keyword=coffee|grocery|restaurant&key={GOOGLE_API_KEY}"
                places_res = requests.get(places_url).json()
                
                competitors = []
                for place in places_res.get('results', [])[:6]: 
                    competitors.append({
                        "name": place.get('name'),
                        "type": place.get('types')[0].replace('_', ' ').title(),
                        "dist": "Live Scan",
                        "lat": place['geometry']['location']['lat'],
                        "lng": place['geometry']['location']['lng']
                    })
                
                # Successfully pulled live data. Return it.
                return jsonify({
                    "loc": { "lat": lat, "lng": lng, "address": address },
                    "fit": { "score": max(10, 100 - (len(competitors) * 5)), "status": "Live Analysis" },
                    "demo": { "inc": 110000, "pop": 20000 },
                    "radar": { "list": competitors }
                })
        except Exception as e:
            # If Google API call fails for any reason (timeout, quota, error)
            print(f"Google API call failed: {e}. Falling back to seeded data.")
            pass # Continue to the fallback logic below
    
    # --- 2. FALLBACK (Guaranteed Data for Demo) ---
    # If the live data attempt failed, or the user is using the demo address, use the seeded data.
    stony_data = Market.query.filter_by(lookup_key='stony').first()
    
    if stony_data:
        return jsonify({
            "loc": { "lat": stony_data.lat, "lng": stony_data.lng, "address": stony_data.name },
            "fit": { "score": stony_data.score, "status": "Seeded Data" },
            "demo": { "inc": stony_data.avg_income, "pop": stony_data.population },
            "radar": { "list": STONY_COMPETITORS if 'STONY_COMPETITORS' in globals() else [] }
        })
    else:
        # ABSOLUTE FAILURE: Should not happen with self-healing, but catches any other error.
        return jsonify({"error": "No data available in the database."}), 500

# --- DEPLOYMENT STARTUP ---
# Create the initial database structure upon app startup
with app.app_context():
    seed_database_internal()

if __name__ == '__main__':
    # Use the appropriate server startup method for the environment
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
