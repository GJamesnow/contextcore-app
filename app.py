import os
import io
import requests
from flask import Flask, jsonify, request, send_from_directory, send_file, render_template_string
from flask_cors import CORS
from xhtml2pdf import pisa

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY')

# --- THE REPORT TEMPLATE ---
# This CSS is specifically tuned for xhtml2pdf to ensure perfect layout
PDF_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <style>
        @page { size: landscape; margin: 1cm; }
        body { font-family: Helvetica, sans-serif; color: #333; }
        .header { border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 20px; }
        .brand { font-size: 24px; font-weight: bold; color: #2563eb; }
        .subtitle { font-size: 12px; color: #666; margin-top: 5px; }
        
        /* Grid Layout using Tables (Required for PDF compatibility) */
        .grid-table { width: 100%; margin-bottom: 20px; }
        .card { background-color: #f8fafc; padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center; }
        .label { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: bold; }
        .value { font-size: 28px; font-weight: bold; color: #1e293b; margin-top: 5px; }
        
        .map-container { width: 100%; text-align: center; margin-bottom: 20px; border: 1px solid #ccc; }
        .map-img { width: 100%; height: auto; }
        
        .comp-table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .comp-table th { text-align: left; border-bottom: 1px solid #333; padding: 5px; }
        .comp-table td { border-bottom: 1px solid #eee; padding: 5px; }
        
        .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 9px; color: #999; }
    </style>
</head>
<body>
    <div class="header">
        <div class="brand">ContextCore Intelligence</div>
        <div class="subtitle">Investment Brief prepared for: {{ address }}</div>
    </div>

    <table class="grid-table">
        <tr>
            <td style="padding-right: 10px; width: 33%;">
                <div class="card">
                    <div class="label">Opportunity Score</div>
                    <div class="value" style="color: {{ score_color }}">{{ score }}</div>
                </div>
            </td>
            <td style="padding-right: 10px; width: 33%;">
                <div class="card">
                    <div class="label">Market Status</div>
                    <div class="value">{{ status }}</div>
                </div>
            </td>
            <td style="width: 33%;">
                <div class="card">
                    <div class="label">Avg Household Income</div>
                    <div class="value">${{ income }}</div>
                </div>
            </td>
        </tr>
    </table>

    <div class="map-container">
        <img class="map-img" src="{{ static_map_url }}">
    </div>

    <table class="grid-table" style="margin-top: 20px;">
        <tr>
            <td style="width: 48%; vertical-align: top; padding-right: 2%;">
                <h3 style="margin-top: 0; font-size: 14px;">Competitive Set</h3>
                <table class="comp-table">
                    <thead><tr><th>Name</th><th>Type</th></tr></thead>
                    <tbody>
                        {% for comp in competitors %}
                        <tr><td>{{ comp.name }}</td><td>{{ comp.type }}</td></tr>
                        {% endfor %}
                    </tbody>
                </table>
            </td>
            <td style="width: 48%; vertical-align: top; padding-left: 2%;">
                <h3 style="margin-top: 0; font-size: 14px;">Void Analysis</h3>
                {% if voids %}
                    <div style="background: #fff5f5; border: 1px solid #feb2b2; padding: 10px; border-radius: 4px;">
                        <p style="margin: 0 0 5px 0; font-size: 11px; font-weight: bold; color: #c53030;">MISSING AMENITIES:</p>
                        <ul style="margin: 0; padding-left: 20px;">
                        {% for void in voids %}
                            <li style="color: #c53030; font-weight: bold;">{{ void }}</li>
                        {% endfor %}
                        </ul>
                    </div>
                    <p style="font-size: 10px; color: #666; margin-top: 10px;">
                        The absence of these key retail anchors indicates a significant development or leasing opportunity in the trade area.
                    </p>
                {% else %}
                    <div style="background: #f0fff4; border: 1px solid #9ae6b4; padding: 10px; border-radius: 4px;">
                        <p style="color: #2f855a; font-weight: bold; margin: 0;">Market Saturated</p>
                    </div>
                {% endif %}
            </td>
        </tr>
    </table>

    <div class="footer">
        Generated by ContextCore. Proprietary Data. Verification Recommended.
    </div>
</body>
</html>
"""

def get_data_model(address):
    """Core logic to fetch data from Google and structure it."""
    if not GOOGLE_API_KEY: return None, "Server Config Error"

    # 1. Geocode
    try:
        geo = requests.get(f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={GOOGLE_API_KEY}").json()
        if not geo.get('results'): return None, "Address not found"
        loc = geo['results'][0]['geometry']['location']
        lat, lng = loc['lat'], loc['lng']
        fmt_addr = geo['results'][0]['formatted_address']
    except: return None, "Connection Failed"

    # 2. Places Scan
    places = requests.get(f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={lat},{lng}&radius=1500&type=store&keyword=coffee|grocery|fitness&key={GOOGLE_API_KEY}").json()
    
    competitors = []
    found_types = set()
    map_markers = []

    for p in places.get('results', [])[:8]:
        name = p.get('name')
        types = p.get('types', [])
        ctype = "Retail"
        
        if "cafe" in types or "coffee" in name.lower(): 
            ctype = "Coffee"; found_types.add("Coffee")
        elif "grocery" in types or "supermarket" in types: 
            ctype = "Grocery"; found_types.add("Grocery")
        elif "gym" in types or "fitness" in types: 
            ctype = "Fitness"; found_types.add("Fitness")
            
        competitors.append({"name": name, "type": ctype})
        # Add red marker for map
        map_markers.append(f"color:red%7Csize:small%7C{p['geometry']['location']['lat']},{p['geometry']['location']['lng']}")

    # 3. Static Map
    markers_str = f"&markers=color:blue%7Csize:mid%7C{lat},{lng}"
    if map_markers: markers_str += "&markers=" + "&markers=".join(map_markers)
    static_map_url = f"https://maps.googleapis.com/maps/api/staticmap?center={lat},{lng}&zoom=14&size=700x350&maptype=roadmap{markers_str}&key={GOOGLE_API_KEY}"

    # 4. Analysis
    voids = list({"Coffee", "Grocery", "Fitness"} - found_types)
    score = 65 + (len(competitors) * 2)
    if score > 98: score = 98
    score_color = "#2563eb" if score < 80 else "#10b981"
    status = "Stable" if score < 80 else "High Demand"

    return {
        "address": fmt_addr,
        "score": score,
        "score_color": score_color,
        "status": status,
        "income": "125,000",
        "static_map_url": static_map_url,
        "competitors": competitors,
        "voids": voids,
        "lat": lat, "lng": lng
    }, None

@app.route('/')
def home():
    return send_from_directory(app.static_folder, 'dashboard.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    data, err = get_data_model(request.json.get('address'))
    if err: return jsonify({"error": err}), 400
    
    # Return JSON for Dashboard
    return jsonify({
        "loc": {"address": data['address'], "lat": data['lat'], "lng": data['lng']},
        "fit": {"score": data['score'], "status": data['status']},
        "radar": {"list": data['competitors']},
        "voids": data['voids']
    })

@app.route('/download_pdf', methods=['GET'])
def download_pdf():
    """Generates the PDF file on the server."""
    address = request.args.get('address')
    data, err = get_data_model(address)
    if err: return f"Error: {err}", 400

    # 1. Render HTML
    html_content = render_template_string(PDF_TEMPLATE, **data)
    
    # 2. Convert to PDF using xhtml2pdf (PISA)
    pdf_buffer = io.BytesIO()
    pisa_status = pisa.CreatePDF(io.BytesIO(html_content.encode('utf-8')), dest=pdf_buffer)

    if pisa_status.err:
        return "PDF Generation Failed", 500

    pdf_buffer.seek(0)
    
    # 3. Send File
    filename = f"ContextCore_Report_{data['score']}.pdf"
    return send_file(pdf_buffer, as_attachment=True, download_name=filename, mimetype='application/pdf')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
