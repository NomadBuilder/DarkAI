"""
Main Flask application for DarkAI consolidated platform.

Combines three services:
- PersonaForge (/personaforge)
- BlackWire (/blackwire)
- ShadowStack (/shadowstack)
"""

import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# Register blueprints
import sys
import os
from pathlib import Path

# Helper to import blueprint with isolated path
def import_blueprint(blueprint_name, url_prefix):
    """Import a blueprint with its path prioritized."""
    blueprint_path = Path(__file__).parent / blueprint_name
    blueprint_path_str = str(blueprint_path.absolute())
    
    # Remove other blueprint paths to avoid conflicts
    other_blueprints = ['personaforge', 'blackwire', 'shadowstack']
    for other in other_blueprints:
        if other != blueprint_name:
            other_path = str((Path(__file__).parent / other).absolute())
            if other_path in sys.path:
                sys.path.remove(other_path)
    
    # Clear ALL src modules to force fresh import from correct path
    # This ensures each blueprint uses its own modules
    modules_to_remove = [k for k in list(sys.modules.keys()) if k == 'src' or k.startswith('src.')]
    for mod in modules_to_remove:
        del sys.modules[mod]
    
    # Prioritize this blueprint's path
    if blueprint_path_str in sys.path:
        sys.path.remove(blueprint_path_str)
    sys.path.insert(0, blueprint_path_str)
    
    try:
        module = __import__(f'{blueprint_name}.blueprint', fromlist=['blueprint'])
        bp = getattr(module, f'{blueprint_name}_bp')
        app.register_blueprint(bp, url_prefix=url_prefix)
        print(f"✅ {blueprint_name.capitalize()} blueprint registered")
        return True
    except Exception as e:
        print(f"⚠️  {blueprint_name.capitalize()} blueprint failed: {e}")
        import traceback
        traceback.print_exc()
        return False

# Import each blueprint with its path isolated
# Note: ShadowStack dashboard template renamed to shadowstack_dashboard.html
# to avoid conflict with PersonaForge's dashboard.html
import_blueprint('personaforge', '/personaforge')
import_blueprint('blackwire', '/blackwire')
import_blueprint('shadowstack', '/shadowstack')

# Run initial discovery for PersonaForge if database is empty
import threading
import time
def delayed_personaforge_discovery():
    time.sleep(5)  # Wait for app to fully start
    try:
        from personaforge.blueprint import run_initial_discovery
        run_initial_discovery()
    except Exception as e:
        print(f"⚠️  Could not run PersonaForge initial discovery: {e}")

discovery_thread = threading.Thread(target=delayed_personaforge_discovery, daemon=True)
discovery_thread.start()

# Also try to seed dummy data for local development (if database is available)
def delayed_dummy_data_seed():
    time.sleep(7)  # Wait a bit longer for database connections
    try:
        import sys
        from pathlib import Path
        personaforge_path = Path(__file__).parent / 'personaforge'
        sys.path.insert(0, str(personaforge_path))
        from src.database.seed_dummy_data import seed_dummy_data
        from src.database.postgres_client import PostgresClient
        
        client = PostgresClient()
        if client and client.conn:
            # Check if database is empty
            domains = client.get_all_enriched_domains()
            if len(domains) == 0:
                print("🔍 Database is empty - seeding dummy data for visualization testing...")
                seed_dummy_data(num_domains=50)
                print("✅ Dummy data seeded successfully")
            else:
                print(f"✅ Database has {len(domains)} domains - skipping dummy data seed")
            client.close()
        else:
            print("⚠️  Database not available - skipping dummy data seed")
    except Exception as e:
        print(f"⚠️  Could not seed dummy data: {e}")

dummy_data_thread = threading.Thread(target=delayed_dummy_data_seed, daemon=True)
dummy_data_thread.start()


@app.route('/')
def index():
    """Dark-AI homepage."""
    from flask import render_template
    try:
        return render_template('darkai_home.html')
    except:
        # Fallback to send_from_directory if template not found
        return send_from_directory('templates', 'darkai_home.html')


@app.route('/about')
def about():
    """Dark-AI about page."""
    from flask import render_template
    try:
        return render_template('about.html')
    except:
        # Fallback to send_from_directory if template not found
        return send_from_directory('templates', 'about.html')


# Serve static files from root (for Dark-AI homepage)
@app.route('/static/<path:filename>')
def serve_static(filename):
    """Serve static files."""
    return send_from_directory('static', filename)


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

