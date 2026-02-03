"""
Main Flask application for DarkAI consolidated platform.

Combines three services:
- PersonaForge (/personaforge)
- BlackWire (/blackwire)
- ShadowStack (/shadowstack)
"""

import os
from datetime import datetime
from flask import Flask, send_from_directory, jsonify, request, render_template, redirect, abort, Response
from flask_cors import CORS
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import requests
import json

load_dotenv()

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# Make GTM_ID available to all templates
@app.context_processor
def inject_gtm_id():
    return {'GTM_ID': os.getenv('NEXT_PUBLIC_GTM_ID', 'GTM-MZ69VXXL')}

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
# Set SKIP_BLUEPRINTS=1 for local ProtectOnt-only testing (no DB/neo4j/tensorflow needed)
if os.getenv("SKIP_BLUEPRINTS") != "1":
    import_blueprint('personaforge', '/personaforge')
    import_blueprint('blackwire', '/blackwire')
    import_blueprint('shadowstack', '/shadowstack')
else:
    print("⚠️  SKIP_BLUEPRINTS=1: Only ProtectOnt/Ledger routes and core routes will work.")

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


# Option A: ProtectOnt.ca serves Ledger at root; darkai.ca/ledger redirects to ProtectOnt.ca
# Try static/protectont first (build copies ledger/out there on Render so it's not excluded by .gitignore)
# then ledger/out (local or if copy step is skipped)
def _ledger_dir():
    base = os.path.dirname(__file__)
    for subpath in ("static", "protectont"), ("ledger", "out"):
        d = os.path.join(base, *subpath)
        if os.path.isdir(d) and os.path.isfile(os.path.join(d, "index.html")):
            return d
    return os.path.join(base, "ledger", "out")


def _get_resolved_host():
    """Host we use for ProtectOnt detection. Check all common proxy headers (Render may use any)."""
    # Order: X-Forwarded-Host (common), then Host (Render may pass original host), then Forwarded
    raw = (
        request.headers.get("X-Forwarded-Host")
        or request.host
        or _parse_forwarded_host(request.headers.get("Forwarded"))
        or ""
    )
    return raw.split(",")[0].strip().lower().split(":")[0]


def _parse_forwarded_host(forwarded):
    """Extract host from Forwarded: host=\"...\" header if present."""
    if not forwarded:
        return None
    for part in forwarded.split(";"):
        part = part.strip().lower()
        if part.startswith("host="):
            v = part[5:].strip('"')
            return v
    return None


def is_protect_ontario_domain():
    host = _get_resolved_host()
    # Exact match; also accept if host ends with .protectont.ca (e.g. www.protectont.ca)
    return host in ("protectont.ca", "www.protectont.ca") or host.endswith(".protectont.ca")


def serve_ledger_at_root(path):
    """Serve Ledger static files at root (for ProtectOnt.ca). Uses static/protectont or ledger/out."""
    LEDGER_DIR = _ledger_dir()
    if not os.path.isdir(LEDGER_DIR):
        return jsonify({
            "error": "Protect Ontario app not built yet",
            "message": "Ledger build may still be in progress. Check Render build logs.",
            "ledger_dir": LEDGER_DIR,
            "detected_host": _get_resolved_host(),
            "x_forwarded_host": request.headers.get("X-Forwarded-Host"),
        }), 503
    index_path = os.path.join(LEDGER_DIR, "index.html")
    if not os.path.isfile(index_path):
        return jsonify({
            "error": "Protect Ontario index not found",
            "message": "ledger/out or static/protectont missing index.html. Check Render build logs.",
            "ledger_dir": LEDGER_DIR,
            "detected_host": _get_resolved_host(),
            "x_forwarded_host": request.headers.get("X-Forwarded-Host"),
        }), 503
    path = (path or "").strip("/")
    if not path or path == "index.html":
        return send_from_directory(LEDGER_DIR, "index.html")
    if path.endswith(".html"):
        try:
            return send_from_directory(LEDGER_DIR, path)
        except Exception:
            pass
    if not path.startswith(("_next/", "data/", "favicon", "logo", "og-image")):
        try:
            return send_from_directory(LEDGER_DIR, path + ".html")
        except Exception:
            pass
    try:
        return send_from_directory(LEDGER_DIR, path)
    except Exception:
        pass
    return send_from_directory(LEDGER_DIR, "index.html")


def _load_protectont_context():
    """Load Protect Ontario chat context JSON from static/protectont or ledger/out."""
    base_dir = _ledger_dir()
    context_path = os.path.join(base_dir, "chat-context.json")
    if not os.path.isfile(context_path):
        return None
    try:
        with open(context_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None


@app.route('/api/chat', methods=['POST'])
def protectont_chat():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return jsonify({"error": "GEMINI_API_KEY not configured"}), 500

    payload = request.get_json(silent=True) or {}
    message = (payload.get("message") or "").strip()
    if not message:
        return jsonify({"error": "Message is required"}), 400

    context = _load_protectont_context()
    context_text = json.dumps(context, ensure_ascii=False, indent=2) if context else "{}"

    system_prompt = (
        "You are the Protect Ontario site assistant. "
        "Answer ONLY using the provided site context. "
        "If the answer is not in the context, say you don't have that information "
        "and suggest relevant site pages (e.g., /water, /greenbelt, /healthcare, /wildlife, /protests, /methodology, /media). "
        "Do not use external knowledge."
    )

    user_prompt = f"{system_prompt}\n\nSITE CONTEXT JSON:\n{context_text}\n\nUSER QUESTION:\n{message}"

    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    headers = {
        "Content-Type": "application/json",
        "X-goog-api-key": api_key,
    }
    data = {
        "contents": [
            {
                "parts": [
                    {"text": user_prompt}
                ]
            }
        ]
    }

    try:
        resp = requests.post(url, headers=headers, json=data, timeout=20)
        resp.raise_for_status()
        result = resp.json()
        answer = (
            result.get("candidates", [{}])[0]
            .get("content", {})
            .get("parts", [{}])[0]
            .get("text", "")
        )
        if not answer:
            answer = "I don't have enough information in the site context to answer that."
        return jsonify({"answer": answer})
    except requests.RequestException as e:
        return jsonify({"error": "Chat request failed", "details": str(e)}), 502
    except Exception as e:
        return jsonify({"error": "Chat request failed", "details": str(e)}), 500


# robots.txt for protectont.ca: allow all crawlers including Facebook (fixes FB Sharing Debugger 403)
PROTECTONT_ROBOTS_TXT = """User-agent: *
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: Facebot
Allow: /

Sitemap: https://protectont.ca/
"""


@app.before_request
def protect_ontario_and_ledger_redirect():
    if is_protect_ontario_domain():
        path = request.path.lstrip("/")
        if path == "_ledger-status":
            return None  # Let the diagnostic route handle it
        if path.startswith("api/"):
            return None  # Let ProtectOnt API routes handle this
        if path == "robots.txt":
            return Response(PROTECTONT_ROBOTS_TXT, mimetype="text/plain")
        return serve_ledger_at_root(path)
    if request.path == "/ledger" or request.path.startswith("/ledger/"):
        rest = request.path[7:].strip("/")
        return redirect("https://protectont.ca/" + (rest or ""), code=302)
    return None


@app.route("/_ledger-status")
def ledger_status():
    """Diagnostic: see what host we see and whether Ledger build is present. Safe to hit from protectont.ca or darkai.ca."""
    host = _get_resolved_host()
    LEDGER_DIR = _ledger_dir()
    ledger_dir_exists = os.path.isdir(LEDGER_DIR)
    index_exists = os.path.isfile(os.path.join(LEDGER_DIR, "index.html")) if ledger_dir_exists else False
    return jsonify({
        "request_host": request.host,
        "x_forwarded_host": request.headers.get("X-Forwarded-Host"),
        "forwarded_header": request.headers.get("Forwarded"),
        "resolved_host": host,
        "is_protect_ontario": is_protect_ontario_domain(),
        "ledger_dir_exists": ledger_dir_exists,
        "ledger_index_exists": index_exists,
        "ledger_dir": LEDGER_DIR,
        "ok": is_protect_ontario_domain() and ledger_dir_exists and index_exists,
    }), 200


@app.route('/')
def index():
    """Dark AI homepage."""
    from flask import render_template
    try:
        return render_template('darkai_home.html')
    except:
        # Fallback to send_from_directory if template not found
        return send_from_directory('templates', 'darkai_home.html')


@app.route('/dashboard')
def dashboard():
    """Main dashboard - redirects to PersonaForge dashboard."""
    from flask import redirect, url_for
    return redirect('/personaforge/dashboard')


@app.route('/about')
def about():
    """Dark AI about page."""
    from flask import render_template
    try:
        return render_template('about.html')
    except:
        # Fallback to send_from_directory if template not found
        return send_from_directory('templates', 'about.html')

@app.route('/faq')
def faq():
    """Dark AI FAQ page."""
    from flask import render_template
    try:
        return render_template('faq.html')
    except:
        # Fallback to send_from_directory if template not found
        return send_from_directory('templates', 'faq.html')

@app.route('/humangate')
def humangate():
    """HumanGate WordPress plugin page."""
    from flask import render_template
    try:
        return render_template('humangate.html')
    except:
        # Fallback to send_from_directory if template not found
        return send_from_directory('templates', 'humangate.html')

@app.route('/flyt')
def flyt():
    """Flyt landing page."""
    from flask import render_template
    try:
        return render_template('flyt.html')
    except:
        # Fallback to send_from_directory if template not found
        return send_from_directory('templates', 'flyt.html')


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


@app.route('/api/waitlist', methods=['POST', 'OPTIONS'])
def waitlist():
    """Handle Flyt waitlist email submission - stores in database and optionally sends confirmation."""
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response
    
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        
        # Validate email
        if not email or '@' not in email:
            response = jsonify({'success': False, 'error': 'Invalid email address'})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 400
        
        # Store in database asynchronously (don't block response)
        # Return success immediately, store in background
        stored_in_db = False
        
        def store_email_async(email):
            """Store email in database in background thread."""
            try:
                from personaforge.src.database.postgres_client import PostgresClient
                postgres_client = PostgresClient()
                
                if postgres_client and postgres_client.conn:
                    # Create waitlist table if it doesn't exist
                    cursor = postgres_client.conn.cursor()
                    cursor.execute("""
                        CREATE TABLE IF NOT EXISTS flyt_waitlist (
                            id SERIAL PRIMARY KEY,
                            email VARCHAR(255) UNIQUE NOT NULL,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            confirmed BOOLEAN DEFAULT FALSE
                        )
                    """)
                    postgres_client.conn.commit()
                    
                    # Insert email (or update if exists)
                    cursor.execute("""
                        INSERT INTO flyt_waitlist (email) 
                        VALUES (%s)
                        ON CONFLICT (email) DO NOTHING
                        RETURNING id
                    """, (email,))
                    
                    if cursor.rowcount > 0:
                        postgres_client.conn.commit()
                        print(f"✅ Email stored in database: {email}")
                    else:
                        print(f"ℹ️  Email already exists in database: {email}")
                    
                    cursor.close()
                    if postgres_client.conn:
                        postgres_client.conn.close()
            except Exception as db_error:
                print(f"⚠️  Database storage failed: {db_error}")
        
        # Start database storage in background thread (non-blocking)
        import threading
        db_thread = threading.Thread(target=store_email_async, args=(email,), daemon=True)
        db_thread.start()
        
        # Optionally send confirmation email (reuse existing email infrastructure)
        send_confirmation = os.getenv('SEND_WAITLIST_CONFIRMATION', 'false').lower() == 'true'
        
        if send_confirmation:
            resend_api_key = os.getenv('RESEND_API_KEY', '')
            from_email = os.getenv('FROM_EMAIL', 'onboarding@resend.dev')
            
            if resend_api_key:
                try:
                    url = "https://api.resend.com/emails"
                    headers = {
                        "Authorization": f"Bearer {resend_api_key}",
                        "Content-Type": "application/json"
                    }
                    payload = {
                        "from": from_email,
                        "to": email,
                        "subject": "You're on the Flyt waitlist! 🚀",
                        "html": f"""
                        <h2>Welcome to the Flyt waitlist!</h2>
                        <p>Thanks for joining! We'll notify you as soon as Flyt is available.</p>
                        <p>You'll be able to control your computer with the wave of your hand - complete freedom, total control.</p>
                        <hr>
                        <p><em>Flyt - At the wave of your hand.</em></p>
                        """,
                        "text": f"""Welcome to the Flyt waitlist!

Thanks for joining! We'll notify you as soon as Flyt is available.

You'll be able to control your computer with the wave of your hand - complete freedom, total control.

---
Flyt - At the wave of your hand.
"""
                    }
                    
                    response = requests.post(url, json=payload, headers=headers)
                    if response.status_code == 200:
                        print(f"✅ Confirmation email sent to {email}")
                    else:
                        print(f"⚠️  Failed to send confirmation email: {response.status_code}")
                except Exception as e:
                    print(f"⚠️  Error sending confirmation email: {e}")
        
        # Success response
        response = jsonify({
            'success': True,
            'message': 'Email added to waitlist',
            'stored_in_db': stored_in_db
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 200
        
    except Exception as e:
        error_msg = f"Error processing waitlist submission: {e}"
        print(f"❌ {error_msg}")
        import traceback
        traceback.print_exc()
        response = jsonify({'success': False, 'error': 'Failed to process submission. Please try again later.'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 500


@app.route('/api/waitlist/view', methods=['GET'])
def view_waitlist():
    """View all emails in the waitlist (admin endpoint)."""
    try:
        from personaforge.src.database.postgres_client import PostgresClient
        postgres_client = PostgresClient()
        
        if not postgres_client or not postgres_client.conn:
            return jsonify({'error': 'Database not available'}), 500
        
        cursor = postgres_client.conn.cursor()
        cursor.execute("""
            SELECT email, created_at, confirmed 
            FROM flyt_waitlist 
            ORDER BY created_at DESC
        """)
        
        emails = []
        for row in cursor.fetchall():
            emails.append({
                'email': row[0],
                'created_at': row[1].isoformat() if row[1] else None,
                'confirmed': row[2]
            })
        
        cursor.close()
        
        return jsonify({
            'success': True,
            'count': len(emails),
            'emails': emails
        }), 200
        
    except Exception as e:
        error_msg = f"Error fetching waitlist: {e}"
        print(f"❌ {error_msg}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to fetch waitlist'}), 500


@app.route('/reports/2025-deepfake-report')
def deepfake_report_2025():
    """2025 Deepfake Report page."""
    from flask import render_template
    try:
        return render_template('report_2025_deepfake.html')
    except:
        # Fallback to send_from_directory if template not found
        return send_from_directory('templates', 'report_2025_deepfake.html')


@app.route('/reports/vendor-intelligence-report')
def vendor_intelligence_report():
    """2025 Synthetic Identity Vendor Intelligence Report page."""
    from flask import render_template
    import json
    from pathlib import Path
    
    # Try to load from static file first (fastest)
    report_data = {}
    static_file = Path(__file__).parent / 'personaforge' / 'static' / 'data' / 'vendor_intelligence_report.json'
    
    if static_file.exists():
        try:
            with open(static_file, 'r') as f:
                static_data = json.load(f)
                # Extract just the stats we need for server-side render
                report_data = {
                    "total_vendors": static_data.get('total_vendors', 0),
                    "vendors_with_domains": static_data.get('vendors_with_domains', 0),
                    "total_domains": static_data.get('total_domains', 0),
                    "stats": {
                        "telegram_percentage": static_data.get('stats', {}).get('telegram_percentage', 0)
                    }
                }
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"Failed to load static report data: {e}")
    
    # Fallback to database if static file not available (but don't block on errors)
    if not report_data:
        try:
            # Import the postgres client and call the data fetching logic directly
            from personaforge.src.database.postgres_client import PostgresClient
            import psycopg2
            
            postgres_client = PostgresClient()
            if postgres_client and postgres_client.conn:
                # Rollback any failed transaction first
                try:
                    postgres_client.conn.rollback()
                except:
                    pass
                
                # Use lightweight SQL queries instead of loading all data
                cursor = postgres_client.conn.cursor()
                
                # Get total vendors count (lightweight)
                cursor.execute("SELECT COUNT(*) FROM personaforge_vendors_intel")
                total_vendors = cursor.fetchone()[0] if cursor.rowcount > 0 else 0
                
                # Get total domains count (lightweight)
                cursor.execute("SELECT COUNT(*) FROM personaforge_domains")
                total_domains = cursor.fetchone()[0] if cursor.rowcount > 0 else 0
                
                # Count vendors with domains (lightweight)
                cursor.execute("SELECT COUNT(DISTINCT vendor_intel_id) FROM personaforge_vendor_intel_domains")
                vendors_with_domains = cursor.fetchone()[0] if cursor.rowcount > 0 else 0
                
                # Calculate Telegram percentage (lightweight - just count)
                cursor.execute("SELECT COUNT(*) FROM personaforge_vendors_intel WHERE platform_type = 'Telegram'")
                telegram_count = cursor.fetchone()[0] if cursor.rowcount > 0 else 0
                telegram_percentage = round((telegram_count / total_vendors * 100), 1) if total_vendors > 0 else 0
                
                cursor.close()
                
                # Create minimal report_data for initial render
                report_data = {
                    "total_vendors": total_vendors,
                    "vendors_with_domains": vendors_with_domains,
                    "total_domains": total_domains,
                    "stats": {
                        "telegram_percentage": telegram_percentage
                    }
                }
        except Exception as e:
            # If data fetch fails, render page anyway (will show loading state)
            import logging
            logging.getLogger(__name__).warning(f"Failed to fetch report data server-side: {e}")
            report_data = {}
    
    try:
        return render_template('report_vendor_intelligence.html', report_data=report_data)
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Error rendering report template: {e}", exc_info=True)
        # Fallback to send_from_directory if template not found
        return send_from_directory('templates', 'report_vendor_intelligence.html')


@app.route('/reports/deepfake-infrastructure-report')
def shadowstack_infrastructure_report():
    """DeepFake Infrastructure Report page."""
    from flask import render_template
    return render_template('report_shadowstack_infrastructure.html')


@app.route('/api/reports/deepfake-infrastructure/export')
def export_shadowstack_infrastructure():
    """Export ShadowStack infrastructure intelligence report as CSV or JSON."""
    from flask import request, Response
    import json
    import csv
    import io
    
    format_type = request.args.get('format', 'csv').lower()
    
    if format_type not in ['csv', 'json']:
        return jsonify({"error": "Invalid format. Use 'csv' or 'json'"}), 400
    
    try:
        # Generate report data dynamically
        from shadowstack.blueprint import _generate_shadowstack_report_data
        data = _generate_shadowstack_report_data()
        
        if format_type == 'csv':
            # Create CSV export
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Write summary stats
            writer.writerow(['Metric', 'Value'])
            writer.writerow(['Total Domains', data.get('total_domains', 0)])
            writer.writerow(['Enriched Domains', data.get('enriched_domains', 0)])
            writer.writerow(['Enrichment Percentage', f"{data.get('enrichment_percentage', 0)}%"])
            writer.writerow([])
            
            # Write top stats
            stats = data.get('stats', {})
            writer.writerow(['Top Provider', 'Name'])
            writer.writerow(['Top Hosting', stats.get('top_hosting', 'N/A')])
            writer.writerow(['Top CDN', stats.get('top_cdn', 'N/A')])
            writer.writerow(['Top ISP', stats.get('top_isp', 'N/A')])
            writer.writerow(['Top Registrar', stats.get('top_registrar', 'N/A')])
            writer.writerow(['Top Country', stats.get('top_country', 'N/A')])
            writer.writerow([])
            
            # Write hosting providers
            writer.writerow(['Hosting Provider', 'Domain Count'])
            infrastructure = data.get('infrastructure', {})
            if 'hosting_providers' in infrastructure:
                for provider, count in list(infrastructure['hosting_providers'].items())[:20]:
                    writer.writerow([provider, count])
            writer.writerow([])
            
            # Write CDNs
            writer.writerow(['CDN', 'Domain Count'])
            if 'cdns' in infrastructure:
                for cdn, count in list(infrastructure['cdns'].items())[:20]:
                    writer.writerow([cdn, count])
            writer.writerow([])
            
            # Write ISPs
            writer.writerow(['ISP', 'Domain Count'])
            if 'isps' in infrastructure:
                for isp, count in list(infrastructure['isps'].items())[:20]:
                    writer.writerow([isp, count])
            writer.writerow([])
            
            # Write Registrars
            writer.writerow(['Registrar', 'Domain Count'])
            if 'registrars' in infrastructure:
                for registrar, count in list(infrastructure['registrars'].items())[:20]:
                    writer.writerow([registrar, count])
            writer.writerow([])
            
            # Write Countries
            writer.writerow(['Country', 'Domain Count'])
            geography = data.get('geography', {})
            if 'countries' in geography:
                for country, count in list(geography['countries'].items())[:20]:
                    writer.writerow([country, count])
            writer.writerow([])
            
            # Write Payment Processors
            writer.writerow(['Payment Processor', 'Domain Count'])
            if 'payment_processors' in infrastructure:
                for processor, count in list(infrastructure['payment_processors'].items())[:20]:
                    writer.writerow([processor, count])
            writer.writerow([])
            
            # Write Key Service Providers
            writer.writerow(['Service Provider', 'Domain Count', 'Percentage'])
            key_providers = data.get('key_service_providers', {})
            if 'top_service_providers' in key_providers:
                for provider in key_providers['top_service_providers']:
                    writer.writerow([provider.get('name', 'N/A'), provider.get('count', 0), f"{provider.get('percentage', 0)}%"])
            
            output.seek(0)
            return Response(
                output.getvalue(),
                mimetype='text/csv',
                headers={
                    'Content-Disposition': 'attachment; filename=shadowstack_infrastructure_report.csv'
                }
            )
        
        elif format_type == 'json':
            return Response(
                json.dumps(data, indent=2, default=str),
                mimetype='application/json',
                headers={
                    'Content-Disposition': 'attachment; filename=shadowstack_infrastructure_report.json'
                }
            )
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


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


# SEO: Serve robots.txt and sitemap.xml
@app.route('/robots.txt')
def robots_txt():
    """Serve robots.txt for SEO."""
    return send_from_directory('static', 'robots.txt', mimetype='text/plain')


@app.route('/sitemap.xml')
def sitemap_xml():
    """Serve sitemap.xml for SEO."""
    return send_from_directory('static', 'sitemap.xml', mimetype='application/xml')


# Export functionality for reports
@app.route('/api/reports/vendor-intelligence/export')
def export_vendor_intelligence():
    """Export vendor intelligence report as CSV or JSON."""
    from flask import request, Response
    import json
    import csv
    import io
    
    format_type = request.args.get('format', 'csv').lower()
    
    if format_type not in ['csv', 'json']:
        return jsonify({"error": "Invalid format. Use 'csv' or 'json'"}), 400
    
    try:
        # Load report data from static file or generate dynamically
        from pathlib import Path
        static_file = Path(__file__).parent / 'personaforge' / 'static' / 'data' / 'vendor_intelligence_report.json'
        
        if static_file.exists():
            with open(static_file, 'r') as f:
                data = json.load(f)
        else:
            # Fallback to dynamic generation
            from personaforge.blueprint import _generate_vendor_intelligence_data
            data = _generate_vendor_intelligence_data()
        
        if format_type == 'csv':
            # Create CSV export
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Write summary stats
            writer.writerow(['Metric', 'Value'])
            writer.writerow(['Total Vendors', data.get('total_vendors', 0)])
            writer.writerow(['Active Vendors', data.get('active_vendors', 0)])
            writer.writerow(['Vendors with Domains', data.get('vendors_with_domains', 0)])
            writer.writerow(['Total Domains', data.get('total_domains', 0)])
            writer.writerow([])
            
            # Write categories
            writer.writerow(['Category', 'Count'])
            if 'categories' in data:
                for category, count in data['categories'].items():
                    writer.writerow([category, count])
            writer.writerow([])
            
            # Write platforms
            writer.writerow(['Platform', 'Count'])
            if 'platforms' in data:
                for platform, count in data['platforms'].items():
                    writer.writerow([platform, count])
            writer.writerow([])
            
            # Write top services
            writer.writerow(['Service', 'Count'])
            if 'services' in data:
                for service, count in list(data['services'].items())[:30]:
                    writer.writerow([service, count])
            
            output.seek(0)
            return Response(
                output.getvalue(),
                mimetype='text/csv',
                headers={
                    'Content-Disposition': 'attachment; filename=vendor_intelligence_report.csv'
                }
            )
        
        elif format_type == 'json':
            return Response(
                json.dumps(data, indent=2, default=str),
                mimetype='application/json',
                headers={
                    'Content-Disposition': 'attachment; filename=vendor_intelligence_report.json'
                }
            )
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route('/api/reports/deepfake/export')
def export_deepfake_report():
    """Export deepfake report as CSV or JSON."""
    from flask import request, Response
    import json
    import csv
    import io
    
    format_type = request.args.get('format', 'csv').lower()
    
    if format_type not in ['csv', 'json']:
        return jsonify({"error": "Invalid format. Use 'csv' or 'json'"}), 400
    
    try:
        # Get survey data
        response = get_survey_data()
        if response[1] != 200:
            return jsonify({"error": "Failed to load survey data"}), 500
        
        data = response[0].get_json()
        
        if format_type == 'csv':
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Write summary
            writer.writerow(['Metric', 'Value'])
            writer.writerow(['Total Responses', data.get('total_responses', 0)])
            writer.writerow([])
            
            # Write awareness data
            writer.writerow(['Awareness Level', 'Count'])
            if 'awareness' in data:
                for level, count in data['awareness'].items():
                    writer.writerow([level, count])
            writer.writerow([])
            
            # Write personal experience
            writer.writerow(['Experience Type', 'Count'])
            if 'personal_experience' in data:
                for exp, count in data['personal_experience'].items():
                    writer.writerow([exp, count])
            writer.writerow([])
            
            # Write age distribution
            writer.writerow(['Age Range', 'Count'])
            if 'age_distribution' in data:
                for age, count in data['age_distribution'].items():
                    writer.writerow([age, count])
            
            output.seek(0)
            return Response(
                output.getvalue(),
                mimetype='text/csv',
                headers={
                    'Content-Disposition': 'attachment; filename=deepfake_report_2025.csv'
                }
            )
        
        elif format_type == 'json':
            return Response(
                json.dumps(data, indent=2, default=str),
                mimetype='application/json',
                headers={
                    'Content-Disposition': 'attachment; filename=deepfake_report_2025.json'
                }
            )
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# Ledger at /ledger: Option A before_request redirects darkai.ca/ledger -> protectont.ca
# (Old serve_ledger route removed; protectont.ca is served at root via serve_ledger_at_root.)


# Send MPP contact email via Resend for tracking
@app.route('/api/ledger/send-mpp-email', methods=['POST'])
def send_mpp_email():
    """Send MPP contact email via Resend for tracking"""
    try:
        data = request.get_json()
        mpp_name = data.get('mppName', '').strip()
        user_name = data.get('userName', 'A concerned constituent').strip()
        message = data.get('message', '').strip()
        
        if not mpp_name:
            return jsonify({"error": "MPP name is required"}), 400
        
        if not message:
            return jsonify({"error": "Message is required"}), 400
        
        # Get Resend API key from environment variable (required)
        resend_api_key = os.getenv('RESEND_API_KEY')
        if not resend_api_key:
            return jsonify({"error": "RESEND_API_KEY not configured"}), 500
        from_email = os.getenv('FROM_EMAIL', 'onboarding@resend.dev')
        contact_email = os.getenv('CONTACT_EMAIL', 'aazirmun@gmail.com')
        
        # Send to your email for tracking (you can see usage in Resend dashboard)
        # Users can still use "Open email client" to send directly to their MPP
        import requests
        response = requests.post(
            'https://api.resend.com/emails',
            headers={
                'Authorization': f'Bearer {resend_api_key}',
                'Content-Type': 'application/json',
            },
            json={
                'from': from_email,
                'to': [contact_email],
                'subject': f'Ledger: MPP Contact - {mpp_name}',
                'text': f'MPP Name: {mpp_name}\nUser Name: {user_name}\n\nMessage:\n{message}',
                'tags': [
                    {'name': 'source', 'value': 'ledger'},
                    {'name': 'mpp_name', 'value': mpp_name.replace(' ', '_')}
                ]
            },
            timeout=10
        )
        
        if response.status_code == 200:
            email_data = response.json()
            return jsonify({
                "success": True,
                "id": email_data.get('id'),
                "message": "Message recorded! You can also send directly to your MPP using 'Open email client'."
            }), 200
        else:
            return jsonify({"error": f"Failed to send: {response.text}"}), 500
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500



# Serve Ledger static files at /ledger path
@app.route('/ledger')
@app.route('/ledger/')
@app.route('/ledger/<path:path>')
def serve_ledger(path='index.html'):
    """Serve the Ledger static files at /ledger path"""
    ledger_dir = os.path.join(os.path.dirname(__file__), 'ledger', 'out')
    if path == 'index.html' or not path:
        return send_from_directory(ledger_dir, 'index.html')
    return send_from_directory(ledger_dir, path)


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

