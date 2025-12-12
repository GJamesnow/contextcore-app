import os
import requests
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

# --- APP SETUP ---
# Set up to serve files from the current directory
app = Flask(__name__, static_folder='.', static_url_path='') 
CORS(app)

# --- CONFIGURATION (Reads from Render Environment Variables) ---
GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY')

# --- ROUTES ---

@app.route('/')
def home():
    # Serves the dashboard.html file
    return send_from_directory(app.static_folder, 'dashboard.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    # Production check: Ensure the key is set on the server
    if not GOOGLE_API_KEY:
        return jsonify({"error": "Configuration Error: GOOGLE_API_KEY is not set on the server."}), 500

    data = request.json
    address = data.get('address', '').strip()
    
    # 1. GEOCODING (Address -> Lat/Lng)
    geo_url = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={GOOGLE_API_KEY}"
    try:
        geo_res = requests.get(geo_url).json()
    except requests.exceptions.RequestException:
        return jsonify({"error": "Network connection to Google failed."}), 503

    if not geo_res.get('results'):
        return jsonify({"error": f"Address not found: {address}"}), 400
        
    location = geo_res['results'][0]['geometry']['location']
    lat, lng = location['lat'], location['lng']
    formatted_address = geo_res['results'][0]['formatted_address']
    
    # 2. COMPETITOR SCAN (Lat/Lng -> Businesses)
    places_url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={lat},{lng}&radius=2000&type=store&keyword=coffee|grocery|restaurant&key={GOOGLE_API_KEY}"
    places_res = requests.get(places_url).json()
    
    competitors = []
    for place in places_res.get('results', [])[:6]: 
        competitors.append({
            "name": place.get('name'),
            "type": place.get('types')[0].replace('_', ' ').title(),
            "dist": "Live Data",
            "lat": place['geometry']['location']['lat'],
            "lng": place['geometry']['location']['lng']
        })

    # 3. DUMMY METRICS (For Demo Only - Needs Census API for real values)
    comp_count = len(competitors)
    score = max(10, 100 - (comp_count * 5)) 
    status = "High Opportunity" if score > 75 else "Moderate Competition"

    return jsonify({
        "loc": { "lat": lat, "lng": lng, "address": formatted_address },
        "fit": { "score": score, "status": status },
        "demo": { "inc": 110000, "pop": 20000 },
        "radar": { "list": competitors }
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
