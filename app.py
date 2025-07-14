import os
import logging
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from gemini_service import GeminiService

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "default-secret-key-for-development")
CORS(app)

# Initialize Gemini service
gemini_service = GeminiService()

@app.route('/')
def index():
    """Main page with the alternative finder interface"""
    return render_template('index.html')

@app.route('/api/search', methods=['POST'])
def search_item():
    """API endpoint to search for item and get alternatives"""
    try:
        data = request.get_json()
        item_name = data.get('item_name', '').strip()
        
        if not item_name:
            return jsonify({'error': 'Item name is required'}), 400
        
        # Get item details and alternatives from Gemini
        result = gemini_service.get_item_details_and_alternatives(item_name)
        
        if result is None:
            return jsonify({'error': 'Failed to get item information. Please try again.'}), 500
        
        return jsonify(result)
    
    except Exception as e:
        logging.error(f"Error in search_item: {str(e)}")
        return jsonify({'error': 'An error occurred while processing your request'}), 500

@app.route('/api/compare', methods=['POST'])
def compare_items():
    """API endpoint to compare original item with selected alternative"""
    try:
        data = request.get_json()
        original_item = data.get('original_item', '').strip()
        alternative_item = data.get('alternative_item', '').strip()
        
        if not original_item or not alternative_item:
            return jsonify({'error': 'Both original and alternative items are required'}), 400
        
        # Get detailed comparison from Gemini
        comparison = gemini_service.get_detailed_comparison(original_item, alternative_item)
        
        if comparison is None:
            return jsonify({'error': 'Failed to generate comparison. Please try again.'}), 500
        
        return jsonify(comparison)
    
    except Exception as e:
        logging.error(f"Error in compare_items: {str(e)}")
        return jsonify({'error': 'An error occurred while generating comparison'}), 500

@app.errorhandler(404)
def not_found(error):
    return render_template('index.html'), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
