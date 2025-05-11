from flask import Flask, request, Blueprint, jsonify, send_file
import requests
import gdown
import re
import os
from datetime import datetime

down = Blueprint('download', __name__)
FILTER_CSV_ENDPOINT = "http://localhost:10000/filter_csv"  # Update if needed

@down.route('/download', methods=['POST'])
def download_file():
    filename = None
    try:
        data = request.get_json()
        drive_link = data.get('link')

        if not drive_link:
            return jsonify({'error': 'Missing Google Drive link'}), 400

        # Extract file ID from Google Drive link
        match = re.search(r'/d/([a-zA-Z0-9_-]+)|id=([a-zA-Z0-9_-]+)', drive_link)
        file_id = match.group(1) if match and match.group(1) else match.group(2)

        if not file_id:
            return jsonify({'error': 'Invalid Google Drive link format'}), 400
            
        # Construct download URL and filename
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"pulse_{file_id}_{timestamp}.xls"
        url = f"https://drive.google.com/uc?id={file_id}"

         # Download file using gdown
        gdown.download(url, filename, quiet=False, use_cookies=False)

        # Check if file exists
        if not os.path.exists(filename):
            return jsonify({'error': 'File download failed'}), 500

         # Forward file to /filter_csv
        with open(filename, 'rb') as f:
            files = {'file': (filename, f)}
            cookie_datetime = request.cookies.get('datetime') or datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            cookies = {'datetime': cookie_datetime}
            response = requests.post(FILTER_CSV_ENDPOINT, files=files, cookies=cookies)

        # Return /filter_csv response
        return jsonify({
            'status': 'forwarded to /filter_csv',
            'filter_csv_status': response.status_code,
            'filter_csv_response': response.json()
        }), response.status_code
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    finally:
        if filename and os.path.exists(filename):
            try:
                os.remove(filename)
            except Exception:
                pass  # Silently fail on cleanup
    