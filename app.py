import os
import io
import requests
from flask import Flask, jsonify, request, send_from_directory, send_file
from flask_cors import CORS
from reportlab.lib.pagesizes import letter, landscape
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.lib import colors

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
    map_markers = []

    # Process results
    for p in places_res.get('results', [])[:8]:
        name = p.get('name')
        types = p.get('types', [])
        
        # Simple classification for report
        ctype = "Retail"
        if "cafe" in types or "coffee" in name.lower(): ctype = "Coffee"
        elif "grocery" in types or "supermarket" in types: ctype = "Grocery"
        elif "gym" in types or "fitness" in types: ctype = "Fitness"

        competitors.append({"name": name, "type": ctype})
        
        # Add red marker for static map
        mlat = p['geometry']['location']['lat']
        mlng = p['geometry']['location']['lng']
        map_markers.append(f"color:red%7Csize:small%7C{mlat},{mlng}")

    # 3. Static Map URL Construction
    # Markers: Blue for subject, Red for comps
    markers_str = f"&markers=color:blue%7Csize:mid%7C{lat},{lng}"
    if map_markers:
        markers_str += "&markers=" + "&markers=".join(map_markers)

    static_map_url = (
        f"https://maps.googleapis.com/maps/api/staticmap?"
        f"center={lat},{lng}&zoom=14&size=600x300&maptype=roadmap"
        f"{markers_str}&key={GOOGLE_API_KEY}"
    )

    # 4. Scoring Logic
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
        "static_map_url": static_map_url
    }, None

@app.route('/')
def home():
    return send_from_directory(app.static_folder, 'dashboard.html')

# Route for the Dashboard UI to load data
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

# Route for the PDF Download (Server-Side Generation)
@app.route('/generate_report', methods=['GET'])
def generate_report():
    address = request.args.get('address')
    if not address:
        return "No address provided", 400

    data, error = get_google_data(address)
    if error:
        return f"Error generating report: {error}", 400

    # --- PDF GENERATION (ReportLab) ---
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=landscape(letter))
    width, height = landscape(letter)

    # 1. Header
    c.setFont("Helvetica-Bold", 24)
    c.drawString(50, height - 50, "Investment Intelligence Brief")
    c.setFont("Helvetica", 10)
    c.setFillColor(colors.grey)
    c.drawString(50, height - 70, f"CONFIDENTIAL REPORT  |  {data['address']}")
    c.line(50, height - 80, width - 50, height - 80)

    # 2. Main Metrics
    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, height - 130, "Opportunity Score")
    
    c.setFont("Helvetica-Bold", 40)
    if data['score'] >= 80: c.setFillColor(colors.green)
    else: c.setFillColor(colors.orange)
    c.drawString(50, height - 170, str(data['score']))
    
    c.setFillColor(colors.black)
    c.setFont("Helvetica", 12)
    c.drawString(120, height - 165, data['status'])

    c.setFont("Helvetica-Bold", 14)
    c.drawString(250, height - 130, "Avg. Income")
    c.setFont("Helvetica", 20)
    c.drawString(250, height - 160, f"${data['income']:,}")

    # 3. Map Image (The reliable part)
    try:
        # Server downloads image directly (No CORS issues)
        img_data = requests.get(data['static_map_url']).content
        map_img = ImageReader(io.BytesIO(img_data))
        # Draw Image (x, y, width, height)
        c.drawImage(map_img, 400, height - 350, width=350, height=200)
    except:
        c.drawString(400, height - 250, "[Map Image Unavailable - Check API Key]")

    # 4. Competitor List
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, height - 250, "Nearby Competitors")
    c.setFont("Helvetica", 10)
    y = height - 280
    for comp in data['competitors'][:5]:
        c.drawString(50, y, f"• {comp['name']} ({comp['type']})")
        y -= 20

    # 5. Footer
    c.setFont("Helvetica-Oblique", 8)
    c.setFillColor(colors.grey)
    c.drawString(50, 30, "Generated by ContextCore. Data for informational purposes only.")

    c.save()
    buffer.seek(0)

    # Final File Name
    safe_name = "".join([c for c in data['address'] if c.isalpha() or c.isdigit() or c==' ']).rstrip()
    filename = f"ContextCore_Report_{safe_name[:20].replace(' ', '_')}.pdf"

    return send_file(buffer, as_attachment=True, download_name=filename, mimetype='application/pdf')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
