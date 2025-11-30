"""
Main Flask application for DarkAI consolidated platform.

Combines three services:
- PersonaForge (/personaforge)
- BlackWire (/blackwire)
- ShadowStack (/shadowstack)
"""

import os
from datetime import datetime
from flask import Flask, send_from_directory, jsonify, request, render_template
from flask_cors import CORS
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import requests

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
    
    # CRITICAL: Don't delete src modules - they need to be available for dynamic loading
    # Instead, just ensure this blueprint's path is prioritized
    # Each blueprint will import its own src modules when needed
    
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

# Also try to seed dummy data for PersonaForge ONCE (if database is available)
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
            # Check specifically for dummy data (not all domains)
            cursor = client.conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM personaforge_domains WHERE source = 'DUMMY_DATA_FOR_TESTING'")
            dummy_count = cursor.fetchone()[0]
            cursor.close()
            
            if dummy_count == 0:
                print("📊 No dummy data found - seeding dummy data for PersonaForge visualization (one-time only)...")
                count = seed_dummy_data(num_domains=50)
                print(f"✅ Seeded {count} dummy domains for PersonaForge visualization")
            else:
                print(f"✅ Dummy data already exists ({dummy_count} domains) - skipping seed")
            client.close()
        else:
            print("⚠️  Database not available - skipping dummy data seed")
    except Exception as e:
        print(f"⚠️  Could not seed dummy data: {e}")

dummy_data_thread = threading.Thread(target=delayed_dummy_data_seed, daemon=True)
dummy_data_thread.start()


@app.route('/')
def index():
    """Dark AI homepage."""
    from flask import render_template
    try:
        return render_template('darkai_home.html')
    except:
        # Fallback to send_from_directory if template not found
        return send_from_directory('templates', 'darkai_home.html')


@app.route('/about')
def about():
    """Dark AI about page."""
    from flask import render_template
    try:
        return render_template('about.html')
    except:
        # Fallback to send_from_directory if template not found
        return send_from_directory('templates', 'about.html')


@app.route('/contact', methods=['POST'])
def contact():
    """Handle contact form submission and send email."""
    try:
        data = request.get_json()
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        message = data.get('message', '').strip()
        
        if not name or not email or not message:
            return jsonify({'success': False, 'error': 'All fields are required'}), 400
        
        # Email configuration from environment variables
        # Try Resend API first (easier setup), fallback to SMTP
        resend_api_key = os.getenv('RESEND_API_KEY', '')
        recipient_email = os.getenv('CONTACT_EMAIL', 'aazirmun@gmail.com')
        from_email = os.getenv('FROM_EMAIL', 'onboarding@resend.dev')  # Default Resend domain
        
        # Try Resend API
        if resend_api_key:
            print(f"📧 Sending email via Resend to {recipient_email}...")
            url = "https://api.resend.com/emails"
            headers = {
                "Authorization": f"Bearer {resend_api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "from": from_email,
                "to": recipient_email,
                "subject": f"Contact from Dark AI: {name}",
                "html": f"""
                <h2>New contact form submission from Dark AI website</h2>
                <p><strong>Name:</strong> {name}</p>
                <p><strong>Email:</strong> {email}</p>
                <p><strong>Message:</strong></p>
                <p>{message.replace(chr(10), '<br>')}</p>
                <hr>
                <p><em>This email was sent from the Dark AI contact form.</em></p>
                """,
                "text": f"""New contact form submission from Dark AI website:

Name: {name}
Email: {email}

Message:
{message}

---
This email was sent from the Dark AI contact form.
"""
            }
            
            response = requests.post(url, json=payload, headers=headers)
            
            if response.status_code == 200:
                print(f"✅ Email sent successfully to {recipient_email}")
                return jsonify({'success': True, 'message': 'Thank you for your message. We will get back to you soon.'})
            else:
                error_data = response.json() if response.content else {}
                error_msg = error_data.get('message', f'HTTP {response.status_code}')
                print(f"❌ Resend API error: {error_msg}")
                return jsonify({'success': False, 'error': 'Failed to send email. Please try again later.'}), 500
        
        # Fallback to SMTP if Resend not configured
        smtp_username = os.getenv('SMTP_USERNAME', '')
        smtp_password = os.getenv('SMTP_PASSWORD', '')
        
        if smtp_username and smtp_password:
            smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
            smtp_port = int(os.getenv('SMTP_PORT', '587'))
            
            # Create email
            msg = MIMEMultipart()
            msg['From'] = smtp_username
            msg['To'] = recipient_email
            msg['Subject'] = f'Contact from Dark AI: {name}'
            
            body = f"""New contact form submission from Dark AI website:

Name: {name}
Email: {email}

Message:
{message}

---
This email was sent from the Dark AI contact form.
"""
            msg.attach(MIMEText(body, 'plain'))
            
            # Send email
            print(f"📧 Attempting to send email via SMTP to {recipient_email}...")
            server = smtplib.SMTP(smtp_server, smtp_port)
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.send_message(msg)
            server.quit()
            print(f"✅ Email sent successfully to {recipient_email}")
            
            return jsonify({'success': True, 'message': 'Thank you for your message. We will get back to you soon.'})
        
        # No email service configured
        print("=" * 60)
        print("⚠️  CONTACT FORM SUBMISSION (EMAIL NOT CONFIGURED)")
        print("=" * 60)
        print(f"Name: {name}")
        print(f"Email: {email}")
        print(f"Message: {message}")
        print(f"Recipient: {recipient_email}")
        print("=" * 60)
        print("To enable email sending, add to .env file:")
        print("  RESEND_API_KEY=re_xxxxxxxxxxxxx")
        print("  FROM_EMAIL=noreply@yourdomain.com (or use Resend's default)")
        print("  CONTACT_EMAIL=aazirmun@gmail.com")
        print("=" * 60)
        print("Get free API key at: https://resend.com/api-keys")
        print("=" * 60)
        return jsonify({'success': True, 'message': 'Thank you for your message. We will get back to you soon.'})
        
    except requests.RequestException as e:
        error_msg = f"Resend API request failed: {e}"
        print(f"❌ {error_msg}")
        return jsonify({'success': False, 'error': 'Failed to send email. Please try again later.'}), 500
    except smtplib.SMTPAuthenticationError as e:
        error_msg = f"SMTP authentication failed: {e}"
        print(f"❌ {error_msg}")
        return jsonify({'success': False, 'error': 'Email authentication failed. Please check SMTP credentials.'}), 500
    except smtplib.SMTPException as e:
        error_msg = f"SMTP error: {e}"
        print(f"❌ {error_msg}")
        return jsonify({'success': False, 'error': 'Failed to send email. Please try again later.'}), 500
    except Exception as e:
        error_msg = f"Error sending contact email: {e}"
        print(f"❌ {error_msg}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': 'Failed to send message. Please try again later.'}), 500


@app.route('/reports/2025-deepfake-report')
def deepfake_report_2025():
    """2025 Deepfake Report page."""
    from flask import render_template
    try:
        return render_template('report_2025_deepfake.html')
    except:
        # Fallback to send_from_directory if template not found
        return send_from_directory('templates', 'report_2025_deepfake.html')


@app.route('/api/reports/survey-data')
def get_survey_data():
    """Process and return survey data for visualizations.
    
    This endpoint is READ-ONLY and does not modify any data.
    It only reads from SurveyData.csv and returns processed statistics.
    """
    import csv
    from collections import Counter
    from pathlib import Path
    
    # Try multiple possible paths (works in both local and Render environments)
    possible_paths = [
        Path(__file__).parent / 'SurveyData.csv',  # Same directory as app.py
        Path.cwd() / 'SurveyData.csv',  # Current working directory
    ]
    
    csv_path = None
    for path in possible_paths:
        if path.exists() and path.is_file():
            csv_path = path
            break
    
    if not csv_path:
        return jsonify({
            "error": "Survey data file not found",
            "message": "SurveyData.csv is required for this report"
        }), 404
    
    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            rows = list(reader)
        
        total_responses = len(rows)
        
        # Process data
        awareness = Counter()
        know_someone = Counter()
        personal_experience = Counter()
        used_tools = Counter()
        worried = Counter()
        ease_of_access = Counter()
        age_distribution = Counter()
        gender_distribution = Counter()
        location_distribution = Counter()
        
        # Gender vs Worry
        gender_worry = {}
        # Gender vs Access
        gender_access = {}
        # Gender vs Personal Experience
        gender_experience = {}
        # Age vs Worry
        age_worry = {}
        
        # Find column keys dynamically (handles quote variations)
        def find_key(keys, search_terms):
            """Find a key that contains all search terms."""
            for key in keys:
                if all(term.lower() in key.lower() for term in search_terms):
                    return key
            return None
        
        # Get all keys from first row
        sample_row = rows[0] if rows else {}
        all_keys = list(sample_row.keys())
        
        # Find actual column names
        awareness_key = find_key(all_keys, ['heard', 'deepfake', 'nudify']) or 'Before today, had you heard of AI deepfake or "nudify" tools that can create fake or sexualized images of real people?'
        know_someone_key = find_key(all_keys, ['know someone', 'deepfake']) or 'Do you personally know someone who had a deepfake or non-consensual sexual AI image made of them?'
        experience_key = find_key(all_keys, ['made of you', 'permission']) or 'Has a deepfake or "nudify" image ever been made of you without your permission?'
        used_tools_key = find_key(all_keys, ['used', 'services']) or 'Have you ever used one of these deepfake or "nudify" services? '
        worried_key = find_key(all_keys, ['worried', 'happening']) or 'Are you worried about this happening to you or those around you?'
        access_key = find_key(all_keys, ['easy', 'access', 'tools']) or 'How easy do you think it is for someone your age to access deepfake or "nudify" tools?'
        
        for row in rows:
            # Awareness
            val = row.get(awareness_key, '').strip()
            awareness[val if val else 'No response'] += 1
            
            # Know someone
            know_val = row.get(know_someone_key, '').strip()
            know_someone[know_val if know_val else 'No response'] += 1
            
            # Personal experience
            exp_val = row.get(experience_key, '').strip()
            personal_experience[exp_val if exp_val else 'No response'] += 1
            
            # Used tools
            used_val = row.get(used_tools_key, '').strip()
            if used_val:
                used_tools[used_val] += 1
            else:
                used_tools['No'] += 1
            
            # Worried
            worry_val = row.get(worried_key, '').strip()
            worried[worry_val if worry_val else 'No response'] += 1
            
            # Ease of access
            access_val = row.get(access_key, '').strip()
            ease_of_access[access_val if access_val else 'No response'] += 1
            
            # Demographics
            age = row.get('Age Range', '').strip() or 'No response'
            age_distribution[age] += 1
            
            gender = row.get('Gender', '').strip() or 'No response'
            gender_distribution[gender] += 1
            
            location = row.get('Where do you reside?', '').strip() or 'No response'
            location_distribution[location] += 1
            
            # Cross-tabulations
            if gender not in gender_worry:
                gender_worry[gender] = Counter()
            gender_worry[gender][worry_val] += 1
            
            if gender not in gender_access:
                gender_access[gender] = Counter()
            gender_access[gender][access_val] += 1
            
            if gender not in gender_experience:
                gender_experience[gender] = Counter()
            gender_experience[gender][exp_val] += 1
            
            if age not in age_worry:
                age_worry[age] = Counter()
            age_worry[age][worry_val] += 1
        
        # Convert to dict format for JSON
        def counter_to_dict(c):
            return dict(c)
        
        return jsonify({
            "total_responses": total_responses,
            "awareness": counter_to_dict(awareness),
            "know_someone": counter_to_dict(know_someone),
            "personal_experience": counter_to_dict(personal_experience),
            "used_tools": counter_to_dict(used_tools),
            "worried": counter_to_dict(worried),
            "ease_of_access": counter_to_dict(ease_of_access),
            "age_distribution": counter_to_dict(age_distribution),
            "gender_distribution": counter_to_dict(gender_distribution),
            "location_distribution": counter_to_dict(location_distribution),
            "gender_worry": {k: counter_to_dict(v) for k, v in gender_worry.items()},
            "gender_access": {k: counter_to_dict(v) for k, v in gender_access.items()},
            "gender_experience": {k: counter_to_dict(v) for k, v in gender_experience.items()},
            "age_worry": {k: counter_to_dict(v) for k, v in age_worry.items()}
        }), 200
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Error processing survey data: {str(e)}"}), 500


# Serve static files from root (for Dark AI homepage)
@app.route('/static/<path:filename>')
def serve_static(filename):
    """Serve static files."""
    return send_from_directory('static', filename)


# Health check endpoint for Render
@app.route('/healthz')
@app.route('/health')
def health():
    """Health check endpoint for Render monitoring."""
    return jsonify({
        "status": "ok",
        "service": "darkai-consolidated",
        "timestamp": datetime.now().isoformat()
    }), 200


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

