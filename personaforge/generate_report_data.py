#!/usr/bin/env python3
"""
Generate static report data for the Vendor Intelligence Report.
Run this script to regenerate the report data JSON file.
"""

import sys
import os
import json
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Import Flask app to get the blueprint context
from flask import Flask
from personaforge.blueprint import personaforge_bp, _generate_vendor_intelligence_data

def generate_report_data():
    """Generate and save the report data to a static JSON file."""
    # Create a minimal Flask app context
    app = Flask(__name__)
    app.register_blueprint(personaforge_bp, url_prefix='/personaforge')
    
    with app.app_context():
        # Call the internal function directly
        print("🔄 Generating vendor intelligence report data...")
        try:
            data = _generate_vendor_intelligence_data()
            # Ensure data is a dict, not a tuple
            if isinstance(data, tuple):
                data = data[0] if len(data) > 0 else {}
        except Exception as e:
            print(f"❌ Error generating report data: {e}")
            import traceback
            traceback.print_exc()
            return False
        
        # Save to static file
        output_dir = Path(__file__).parent / 'static' / 'data'
        output_dir.mkdir(parents=True, exist_ok=True)
        output_file = output_dir / 'vendor_intelligence_report.json'
        
        with open(output_file, 'w') as f:
            json.dump(data, f, indent=2, default=str)
        
        print(f"✅ Report data saved to: {output_file}")
        if isinstance(data, dict):
            print(f"   Total vendors: {data.get('total_vendors', 0)}")
            print(f"   Total domains: {data.get('total_domains', 0)}")
        else:
            print(f"   Data type: {type(data)}")
        
        return True

if __name__ == '__main__':
    success = generate_report_data()
    sys.exit(0 if success else 1)
