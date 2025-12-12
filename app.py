import os
from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS

# --- APP SETUP ---
# Set up to serve files from the current directory
app = Flask(__name__, static_folder='.', static_url_path='') 
CORS(app)

# --- ROUTES ---

@app.route('/')
def home():
    # Serves the dashboard.html file
    return send_from_directory(app.static_folder, 'dashboard.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    # When the frontend calls the server for data, we return an error.
    # The frontend's JavaScript will see this error and immediately run the local demo data.
    return jsonify({"error": "Server is in Demo Mode. Live analysis disabled."}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
