import os
import requests
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

# --- APP SETUP ---
app = Flask(__name__, static_folder='.', static_url_path='') 
CORS(app)

# --- CONFIGURATION ---
GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY')

# --- ROUTES ---

@app.route('/')
def home():
    return send_from_directory(app.static_folder, 'dashboard.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    if not GOOGLE_API_KEY:
        return jsonify({"error": "Configuration Error: GOOGLE_API_KEY is not set."}), 500

    data = request.json
    address = data.get('address', '').strip()
    
    # 1. GEOCODING (Get Coordinates)
    geo_url = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={GOOGLE_API_KEY}"
    try:
        geo_res = requests.get(geo_url).json()
    except:
        return jsonify({"error": "Google Connection Failed"}), 503

    if not geo_res.get('results'):
        return jsonify({"error": "Address not found."}), 400
        
    location = geo_res['results'][0]['geometry']['location']
    lat, lng = location['lat'], location['lng']
    formatted_addr = geo_res['results'][0]['formatted_address']
    
    # 2. COMPETITOR SCAN (Find nearby amenities for Void Analysis)
    scan_types = ["cafe", "supermarket", "gym"]
    found_types = []
    competitors = []

    # Search within 1.5km (1500 meters)
    places_url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={lat},{lng}&radius=1500&type=store&keyword=coffee|grocery|fitness&key={GOOGLE_API_KEY}"
    places_res = requests.get(places_url).json()
    
    static_map_markers = []

    for place in places_res.get('results', [])[:8]:
        p_types = place.get('types', [])
        name = place.get('name')
        
        c_type = "Retail"
        
        # Determine Amenity Type for Void Analysis
        if "cafe" in p_types or "coffee" in name.lower(): 
            c_type = "Coffee"
            found_types.append("cafe")
        elif "supermarket" in p_types or "grocery" in p_types: 
            c_type = "Grocery"
            found_types.append("supermarket")
        elif "gym" in p_types or "fitness" in p_types: 
            c_type = "Fitness"
            found_types.append("gym")
            
        competitors.append({
            "name": name,
            "type": c_type,
            "dist": "Within 1.5km", 
            "lat": place['geometry']['location']['lat'],
            "lng": place['geometry']['location']['lng']
        })
        
        # Add competitor location to the static map markers list
        static_map_markers.append(f"color:red%7Csize:small%7C{place['geometry']['location']['lat']},{place['geometry']['location']['lng']}")

    # 3. VOID LOGIC & SCORING
    voids = [t for t in scan_types if t not in found_types]
    base_score = 60
    opp_score = min(98, base_score + (len(voids) * 12))
    status = "Stable Market"
    if opp_score > 85: status = "High Opportunity (Underserved)"
    elif opp_score < 65: status = "Saturated Market"

    # 4. STATIC MAP URL GENERATION
    # Subject property marker
    subject_marker = f"color:blue%7Csize:large%7C{lat},{lng}"
    
    # Concatenate all markers
    all_markers = [subject_marker] + static_map_markers
    markers_param = "&markers=" + "&markers=".join(all_markers)
    
    # Final Static Map URL
    # Size 600x400 is ideal for a PDF
    static_map_url = (
        f"https://maps.googleapis.com/maps/api/staticmap?"
        f"center={lat},{lng}"
        f"&zoom=14"  # Zoom level 14 is good for a 3km radius view
        f"&size=600x400"
        f"&maptype=roadmap"
        f"{markers_param}"
        f"&key={GOOGLE_API_KEY}"
    )

    # 5. DEMOGRAPHICS (Simulated based on Opportunity Score)
    est_income = 75000 + (opp_score * 500) 
    
    return jsonify({
        "loc": { "lat": lat, "lng": lng, "address": formatted_addr },
        "fit": { "score": opp_score, "status": status },
        "demo": { "inc": est_income, "pop": "Census API req." }, 
        "radar": { "list": competitors, "voids": voids },
        "static_map_url": static_map_url  # <-- NEW: The static map image URL for the PDF
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
