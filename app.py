import os
import requests
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# NOTE: GOOGLE_API_KEY must be set as an environment variable in your Render dashboard
GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY')

def get_google_data(address):
    """Fetches Geocoding and Places data from Google, and prepares report data."""
    if not GOOGLE_API_KEY:
        return None, "Server Config Error: Missing API Key"

    # 1. Geocode
    geo_url = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={GOOGLE_API_KEY}"
    try:
        geo_res = requests.get(geo_url).json()
    except:
        return None, "Failed to connect to Google Maps"

    if not geo_res.get('results'):
        return None, "Address not found"

    loc = geo_res['results'][0]['geometry']['location']
    fmt_address = geo_res['results'][0]['formatted_address']
    lat, lng = loc['lat'], loc['lng']

    # 2. Competitor Scan
    places_url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={lat},{lng}&radius=1500&type=store&keyword=coffee|grocery|fitness&key={GOOGLE_API_KEY}"
    places_res = requests.get(places_url).json()

    competitors = []

    for p in places_res.get('results', [])[:8]:
        name = p.get('name')
        types = p.get('types', [])
        
        # Simple classification
        ctype = "Retail"
        if "cafe" in types or "coffee" in name.lower(): ctype = "Coffee"
        elif "grocery" in types or "supermarket" in types: ctype = "Grocery"
        elif "gym" in types or "fitness" in types: ctype = "Fitness"

        competitors.append({
            "name": name, 
            "type": ctype, 
            "lat": p['geometry']['location']['lat'], 
            "lng": p['geometry']['location']['lng']
        })

    # 3. Scoring Logic
    score = 65 + (len(competitors) * 2) 
    if score > 98: score = 98
    
    status = "Stable"
    if score > 80: status = "High Demand"

    return {
        "address": fmt_address,
        "lat": lat, "lng": lng,
        "score": score,
        "status": status,
        "income": 125000, 
        "competitors": competitors,
    }, None

@app.route('/')
def home():
    return send_from_directory(app.static_folder, 'dashboard.html')

@app.route('/analyze', methods=['POST'])
def analyze_route():
    data = request.json
    address = data.get('address', '')
    result, error = get_google_data(address)
    
    if error:
        return jsonify({"error": error}), 400

    # Return only the necessary JSON for the Dashboard
    return jsonify({
        "loc": {"address": result['address'], "lat": result['lat'], "lng": result['lng']},
        "fit": {"score": result['score'], "status": result['status']},
        "demo": {"inc": result['income']},
        "radar": {"list": result['competitors']}
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
