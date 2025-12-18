"""
DFaceSearch Flask Blueprint - Isolated deepfake image search tool.

This blueprint is completely isolated from other modules.
Uses deepface library for face recognition (free, local).
"""

import os
import sys
from pathlib import Path
from flask import Blueprint, render_template, jsonify, request, send_from_directory
from werkzeug.utils import secure_filename
import json
import hashlib
from datetime import datetime
from dotenv import load_dotenv
import requests
import tempfile

# Isolated blueprint - don't import from other modules
blueprint_dir = Path(__file__).parent.absolute()
sys.path.insert(0, str(blueprint_dir))

# Load environment variables
consolidated_root = blueprint_dir.parent
load_dotenv(dotenv_path=consolidated_root / '.env')
load_dotenv(dotenv_path=blueprint_dir / '.env', override=False)

# Create blueprint
dfacesearch_bp = Blueprint(
    'dfacesearch',
    __name__,
    template_folder=str(blueprint_dir / 'templates'),
    static_folder=str(blueprint_dir / 'static'),
    static_url_path='/dfacesearch/static'
)

# Configuration
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
UPLOAD_FOLDER = blueprint_dir / 'static' / 'uploads'

# Ensure upload directory exists
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)

def allowed_file(filename):
    """Check if file extension is allowed."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_shadowstack_domains():
    """Get ShadowStack domains for cross-referencing - isolated query."""
    try:
        import psycopg2
        from urllib.parse import urlparse
        
        # Get database connection from env vars
        database_url = os.getenv("DATABASE_URL")
        if database_url:
            parsed = urlparse(database_url)
            conn = psycopg2.connect(
                host=parsed.hostname,
                port=parsed.port or 5432,
                user=parsed.username,
                password=parsed.password,
                database=parsed.path.lstrip('/'),
                sslmode='require' if 'render.com' in parsed.hostname else None
            )
        else:
            # Fallback to individual env vars
            conn = psycopg2.connect(
                host=os.getenv("POSTGRES_HOST", "localhost"),
                port=os.getenv("POSTGRES_PORT", "5432"),
                user=os.getenv("POSTGRES_USER", "ncii_user"),
                password=os.getenv("POSTGRES_PASSWORD", "ncii123password"),
                database=os.getenv("POSTGRES_DB", "ncii_infra")
            )
        
        cursor = conn.cursor()
        cursor.execute("""
            SELECT domain FROM domains
            WHERE (source ILIKE 'SHADOWSTACK%' OR source ILIKE 'ShadowStack%')
        """)
        domains = [row[0] for row in cursor.fetchall()]
        cursor.close()
        conn.close()
        return set(domains)
    except Exception as e:
        print(f"⚠️  Could not load ShadowStack domains: {e}")
        return set()

# Cache ShadowStack domains
SHADOWSTACK_DOMAINS = get_shadowstack_domains()

@dfacesearch_bp.route('/')
def index():
    """Main search page."""
    return render_template('dfacesearch_index.html')

@dfacesearch_bp.route('/static/<path:filename>')
def serve_static(filename):
    """Serve static files (CSS, JS)."""
    return send_from_directory(
        str(blueprint_dir / 'static'),
        filename
    )

@dfacesearch_bp.route('/temp/<filename>')
def serve_temp_image(filename):
    """Serve temporary image (private, only accessible during search)."""
    # Security: Only serve files from uploads folder, validate filename
    if '..' in filename or '/' in filename:
        return jsonify({'error': 'Invalid filename'}), 400
    
    filepath = UPLOAD_FOLDER / filename
    if not filepath.exists():
        return jsonify({'error': 'Image not found'}), 404
    
    # Serve image with no-cache headers
    return send_from_directory(
        str(UPLOAD_FOLDER),
        filename,
        mimetype='image/jpeg'  # Will auto-detect based on file
    )

@dfacesearch_bp.route('/api/search', methods=['POST'])
def search_image():
    """Search for similar faces online."""
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Allowed: PNG, JPG, JPEG, GIF, WEBP'}), 400
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_filename = f"{timestamp}_{filename}"
        filepath = UPLOAD_FOLDER / unique_filename
        file.save(str(filepath))
        
        # Verify face exists using deepface (free, local)
        try:
            from deepface import DeepFace
            
            # Check if face exists in image
            try:
                # This will raise exception if no face detected
                faces = DeepFace.extract_faces(
                    img_path=str(filepath),
                    detector_backend='opencv'  # Fast, free detector
                )
                if not faces or len(faces) == 0:
                    if filepath.exists():
                        filepath.unlink()
                    return jsonify({'error': 'No face detected in image. Please upload an image with a clear face.'}), 400
            except ValueError as e:
                if 'Face could not be detected' in str(e) or 'No face detected' in str(e):
                    if filepath.exists():
                        filepath.unlink()
                    return jsonify({'error': 'No face detected in image. Please upload an image with a clear face.'}), 400
                raise
            
            # Extract face embedding for similarity matching (CRITICAL for deepfake detection)
            # This allows us to find the same person even if image is modified/deepfaked
            source_embedding = DeepFace.represent(
                img_path=str(filepath),
                model_name='VGG-Face',  # Good balance of accuracy and speed
                enforce_detection=False
            )
            if not source_embedding or len(source_embedding) == 0:
                if filepath.exists():
                    filepath.unlink()
                return jsonify({'error': 'Could not extract face features'}), 400
            
            source_embedding_vector = source_embedding[0]['embedding']
            print(f"✅ Extracted face embedding: {len(source_embedding_vector)} dimensions")
            
        except ImportError:
            # If deepface not installed, skip face detection (for development)
            print("⚠️  DeepFace not installed - skipping face detection")
        except Exception as e:
            # Clean up file
            if filepath.exists():
                filepath.unlink()
            error_msg = str(e)
            if 'Face could not be detected' in error_msg:
                return jsonify({'error': 'No face detected in image. Please upload an image with a clear face.'}), 400
            return jsonify({'error': f'Face detection failed: {error_msg}'}), 400
        
        # Deepfake detection (optional - runs after face detection)
        deepfake_result = None
        try:
            # Import from same directory (blueprint_dir is already in sys.path)
            from deepfake_detection import detect_deepfake
            deepfake_result = detect_deepfake(str(filepath))
            if deepfake_result.get("available"):
                print(f"🔍 Deepfake detection: {'LIKELY DEEPFAKE' if deepfake_result.get('is_deepfake') else 'Likely Real'} (confidence: {deepfake_result.get('confidence', 0):.2%})")
            else:
                print("⚠️  Deepfake detection not available (missing dependencies)")
        except ImportError as e:
            print(f"⚠️  Deepfake detection module not available: {e}")
        except Exception as e:
            print(f"⚠️  Deepfake detection failed: {e}")
            # Don't fail the whole search if deepfake detection fails
        
        # Perform reverse image search to find candidate images
        request_host = request.host if request.host else None
        search_results, imgur_deletehash = perform_reverse_image_search(str(filepath), request_host=request_host)
        
        # CRITICAL: Use face recognition to verify if candidate images contain the same person
        # This catches deepfakes that wouldn't match via reverse image search
        verified_results = []
        if 'source_embedding_vector' in locals():
            verified_results = verify_faces_in_results(search_results, source_embedding_vector)
        else:
            # Fallback if embedding extraction failed
            verified_results = search_results
        
        # Cross-reference with ShadowStack domains
        flagged_results = []
        for result in verified_results:
            # Ensure result is a dictionary
            if not isinstance(result, dict):
                print(f"⚠️  Skipping invalid result (not a dict): {result}")
                continue
            domain = extract_domain(result.get('url', ''))
            if domain and domain in SHADOWSTACK_DOMAINS:
                result['flagged'] = True
                result['flag_reason'] = 'Known NCII site'
            else:
                result['flagged'] = False
            flagged_results.append(result)
        
        # Delete image from Imgur immediately after search (privacy)
        if imgur_deletehash:
            try:
                delete_from_imgur(imgur_deletehash)
                print(f"✅ Deleted image from Imgur (privacy)")
            except Exception as e:
                print(f"⚠️  Could not delete from Imgur: {e}")
        
        # Clean up uploaded file (privacy)
        if filepath.exists():
            filepath.unlink()
        
        response_data = {
            'success': True,
            'results': flagged_results,
            'total_results': len(flagged_results),
            'flagged_count': sum(1 for r in flagged_results if r.get('flagged'))
        }
        
        # Add deepfake detection result if available
        if deepfake_result and deepfake_result.get("available"):
            response_data['deepfake_detection'] = {
                'is_deepfake': deepfake_result.get('is_deepfake', False),
                'confidence': deepfake_result.get('confidence', 0.0),
                'method': deepfake_result.get('method', 'unknown'),
                'details': deepfake_result.get('details', {})
            }
        
        return jsonify(response_data)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Search failed: {str(e)}'}), 500

def perform_reverse_image_search(image_path, request_host=None):
    """Perform reverse image search using free APIs."""
    results = []
    imgur_deletehash = None  # Store for deletion after search
    
    # Step 1: Upload to Imgur temporarily (will delete after search)
    image_url, imgur_deletehash = upload_to_imgur(image_path)
    
    if not image_url:
        print("⚠️  Could not upload image to Imgur")
        return results, None
    
    print(f"✅ Uploaded to Imgur: {image_url} (will delete after search)")
    
    # Step 2: Try free reverse image search methods FIRST (no API limits!)
    if image_url:
        # Yandex Images (free, no limits, good for faces) - PRIMARY
        try:
            yandex_results = search_yandex_images(image_url)
            if isinstance(yandex_results, list):
                results.extend(yandex_results)
                print(f"✅ Yandex: Found {len(yandex_results)} results")
            else:
                print(f"⚠️  Yandex returned invalid format: {type(yandex_results)}")
        except Exception as e:
            print(f"⚠️  Yandex search failed: {e}")
        
        # Google Images (free, but more fragile) - PRIMARY
        try:
            google_results = search_google_images(image_url)
            if isinstance(google_results, list):
                results.extend(google_results)
                print(f"✅ Google: Found {len(google_results)} results")
            else:
                print(f"⚠️  Google returned invalid format: {type(google_results)}")
        except Exception as e:
            print(f"⚠️  Google Images search failed: {e}")
        
        # Bing Visual Search (free alternative) - PRIMARY
        try:
            bing_results = search_bing_visual(image_url)
            if isinstance(bing_results, list):
                results.extend(bing_results)
                print(f"✅ Bing: Found {len(bing_results)} results")
            else:
                print(f"⚠️  Bing returned invalid format: {type(bing_results)}")
        except Exception as e:
            print(f"⚠️  Bing search failed: {e}")
    
    # Step 3: Use SerpAPI ONLY as last resort fallback (if API key available, limited to 100/month)
    # Only use if free methods didn't return enough results
    serpapi_key = os.getenv('SERPAPI_API_KEY')
    if serpapi_key and image_url and len(results) < 5:
        try:
            print("⚠️  Free methods returned few results, trying SerpAPI as fallback...")
            serpapi_results = search_serpapi(image_url, serpapi_key)
            if isinstance(serpapi_results, list):
                results.extend(serpapi_results)
                print(f"✅ SerpAPI (fallback): Found {len(serpapi_results)} results")
            else:
                print(f"⚠️  SerpAPI returned invalid format: {type(serpapi_results)}")
        except Exception as e:
            print(f"⚠️  SerpAPI search failed: {e}")
    
    # Remove duplicates based on URL and ensure all results are dictionaries
    seen_urls = set()
    unique_results = []
    for result in results:
        # Ensure result is a dictionary
        if not isinstance(result, dict):
            print(f"⚠️  Skipping invalid result (not a dict): {type(result)}")
            continue
        url = result.get('url', '')
        if url and url not in seen_urls:
            seen_urls.add(url)
            unique_results.append(result)
    
    return unique_results, imgur_deletehash

def upload_to_imgur(image_path):
    """Upload image to Imgur temporarily (will be deleted after search)."""
    try:
        url = "https://api.imgur.com/3/image"
        
        with open(image_path, 'rb') as f:
            image_data = f.read()
        
        # Imgur allows anonymous uploads without API key (rate limited)
        # For better rate limits, you can get a free API key from imgur.com
        imgur_client_id = os.getenv('IMGUR_CLIENT_ID', '')
        
        headers = {}
        if imgur_client_id:
            headers['Authorization'] = f'Client-ID {imgur_client_id}'
        else:
            # Anonymous upload (very limited rate)
            headers['Authorization'] = 'Client-ID 546c25a59c58ad7'  # Public anonymous client ID
        
        files = {'image': image_data}
        response = requests.post(url, headers=headers, files=files, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('data'):
                image_url = data['data'].get('link')
                deletehash = data['data'].get('deletehash')  # Needed to delete later
                # Imgur returns URLs like https://i.imgur.com/xxxxx.jpg
                return image_url, deletehash
        else:
            print(f"Imgur upload error: {response.status_code} - {response.text}")
            return None, None
    except Exception as e:
        print(f"Imgur upload error: {e}")
        return None, None

def delete_from_imgur(deletehash):
    """Delete image from Imgur using deletehash (privacy)."""
    try:
        url = f"https://api.imgur.com/3/image/{deletehash}"
        
        imgur_client_id = os.getenv('IMGUR_CLIENT_ID', '')
        headers = {}
        if imgur_client_id:
            headers['Authorization'] = f'Client-ID {imgur_client_id}'
        else:
            headers['Authorization'] = 'Client-ID 546c25a59c58ad7'
        
        response = requests.delete(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            return True
        else:
            print(f"Imgur delete error: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"Imgur delete error: {e}")
        return False

def search_yandex_images(image_url):
    """Search Yandex Images reverse search (FREE, no limits)."""
    try:
        # Yandex reverse image search URL
        search_url = f"https://yandex.com/images/search?rpt=imageview&url={image_url}"
        
        # Use requests to get the page
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(search_url, headers=headers, timeout=30, allow_redirects=True)
        
        if response.status_code != 200:
            return []
        
        # Parse HTML to extract results
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(response.text, 'html.parser')
        results = []
        
        # Yandex stores results in specific divs/classes
        # Look for image result links
        for link in soup.find_all('a', href=True):
            href = link.get('href', '')
            # Filter for actual result URLs
            if href.startswith('http') and 'yandex' not in href.lower():
                title = link.get_text(strip=True) or link.get('title', '')
                if title or href:
                    results.append({
                        'url': href,
                        'title': title[:200] if title else '',
                        'source_name': 'Yandex Images'
                    })
        
        # Also try to find serp-item or similar result containers
        for item in soup.find_all(['div', 'li'], class_=lambda x: x and ('serp-item' in x.lower() or 'result' in x.lower())):
            link_elem = item.find('a', href=True)
            if link_elem:
                href = link_elem.get('href', '')
                if href.startswith('http') and 'yandex' not in href.lower():
                    title = link_elem.get_text(strip=True) or link_elem.get('title', '')
                    if href not in [r['url'] for r in results]:
                        results.append({
                            'url': href,
                            'title': title[:200] if title else '',
                            'source_name': 'Yandex Images'
                        })
        
        return results[:20]  # Limit to top 20 results
    except Exception as e:
        print(f"Yandex search error: {e}")
        return []

def search_google_images(image_url):
    """Search Google Images reverse search (FREE, but fragile - may get blocked)."""
    try:
        # Google Lens reverse image search
        search_url = f"https://lens.google.com/uploadbyurl?url={image_url}"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(search_url, headers=headers, timeout=30, allow_redirects=True)
        
        if response.status_code != 200:
            return []
        
        # Parse HTML
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(response.text, 'html.parser')
        results = []
        
        # Google Lens results are in specific structures
        # Look for links to source pages
        for link in soup.find_all('a', href=True):
            href = link.get('href', '')
            if href.startswith('http') and 'google' not in href.lower() and 'lens' not in href.lower():
                title = link.get_text(strip=True) or link.get('title', '')
                if title or href:
                    results.append({
                        'url': href,
                        'title': title[:200] if title else '',
                        'source_name': 'Google Lens'
                    })
        
        return results[:20]  # Limit to top 20
    except Exception as e:
        print(f"Google Images search error: {e}")
        return []

def search_bing_visual(image_url):
    """Search Bing Visual Search (FREE alternative)."""
    try:
        # Bing Visual Search URL
        search_url = f"https://www.bing.com/images/search?view=detailv2&iss=sbi&form=SBIVSP&sbisrc=UrlPaste&q=imgurl:{image_url}"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(search_url, headers=headers, timeout=30, allow_redirects=True)
        
        if response.status_code != 200:
            return []
        
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(response.text, 'html.parser')
        results = []
        
        # Bing stores results in specific divs
        for link in soup.find_all('a', href=True):
            href = link.get('href', '')
            if href.startswith('http') and 'bing' not in href.lower() and 'microsoft' not in href.lower():
                title = link.get_text(strip=True) or link.get('title', '')
                if title or href:
                    results.append({
                        'url': href,
                        'title': title[:200] if title else '',
                        'source_name': 'Bing Visual Search'
                    })
        
        return results[:20]  # Limit to top 20
    except Exception as e:
        print(f"Bing search error: {e}")
        return []

def search_serpapi(image_url, api_key):
    """Search using SerpAPI with publicly accessible image URL (LIMITED: 100/month free tier)."""
    try:
        from serpapi import GoogleSearch
        
        # SerpAPI Google Images reverse search
        search = GoogleSearch({
            "engine": "google_lens",
            "url": image_url,  # Public image URL
            "api_key": api_key
        })
        
        results_data = search.get_dict()
        results = []
        
        # Parse SerpAPI results
        visual_matches = results_data.get('visual_matches', [])
        for match in visual_matches:
            results.append({
                'url': match.get('link', ''),
                'title': match.get('title', ''),
                'source': match.get('source', ''),
                'source_name': 'Google Lens (via SerpAPI)'
            })
        
        return results, None
    except Exception as e:
        print(f"SerpAPI search error: {e}")
        return []

def verify_faces_in_results(search_results, source_embedding, similarity_threshold=0.6):
    """
    Verify if candidate images contain the same person using face recognition.
    
    HOW IT WORKS:
    1. For each candidate image URL from reverse search
    2. Download the image
    3. Extract face embedding (2622-dimensional vector) using DeepFace
    4. Calculate cosine similarity with source embedding
    5. If similarity > 0.6 → Same person found! (even if image is modified/deepfaked)
    
    This catches deepfakes because face embeddings capture facial features,
    not pixel values. So even if the image is altered, the same person will match.
    """
    verified = []
    
    try:
        from deepface import DeepFace
        import numpy as np
        import tempfile
        
        print(f"🔍 Verifying {len(search_results)} candidate images using face recognition...")
        
        for result in search_results:
            # Ensure result is a dictionary
            if not isinstance(result, dict):
                print(f"⚠️  Skipping invalid result in verification (not a dict): {type(result)}")
                continue
            image_url = result.get('url', '')
            if not image_url:
                continue
            
            try:
                # Download candidate image
                response = requests.get(image_url, timeout=10, stream=True, headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                })
                
                if response.status_code != 200:
                    continue
                
                # Save to temporary file
                with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp_file:
                    for chunk in response.iter_content(chunk_size=8192):
                        tmp_file.write(chunk)
                    tmp_path = tmp_file.name
                
                try:
                    # Extract face embedding from candidate image
                    candidate_embedding = DeepFace.represent(
                        img_path=tmp_path,
                        model_name='VGG-Face',
                        enforce_detection=False
                    )
                    
                    if not candidate_embedding or len(candidate_embedding) == 0:
                        os.unlink(tmp_path)
                        continue
                    
                    candidate_vector = candidate_embedding[0]['embedding']
                    
                    # Calculate cosine similarity
                    similarity = cosine_similarity(source_embedding, candidate_vector)
                    
                    # Only include if similarity is above threshold (same person)
                    if similarity >= similarity_threshold:
                        result['face_similarity'] = round(similarity, 3)
                        result['verified'] = True
                        result['match_confidence'] = 'High' if similarity >= 0.8 else 'Medium' if similarity >= 0.7 else 'Low'
                        verified.append(result)
                        print(f"  ✅ Match: {image_url[:60]}... (similarity: {similarity:.3f})")
                
                finally:
                    if os.path.exists(tmp_path):
                        os.unlink(tmp_path)
            
            except Exception as e:
                print(f"  ⚠️  Verification failed for {image_url[:60]}...: {e}")
                continue
        
        print(f"✅ Face verification: {len(verified)}/{len(search_results)} matches")
        
    except ImportError:
        print("⚠️  DeepFace not available - skipping face verification")
        return search_results
    except Exception as e:
        print(f"⚠️  Face verification error: {e}")
        return search_results
    
    return verified

def cosine_similarity(vec1, vec2):
    """Calculate cosine similarity between two face embedding vectors."""
    import numpy as np
    
    vec1 = np.array(vec1)
    vec2 = np.array(vec2)
    
    dot_product = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    
    if norm1 == 0 or norm2 == 0:
        return 0.0
    
    return dot_product / (norm1 * norm2)

def extract_domain(url):
    """Extract domain from URL."""
    try:
        from urllib.parse import urlparse
        parsed = urlparse(url)
        domain = parsed.netloc
        if domain.startswith('www.'):
            domain = domain[4:]
        return domain
    except:
        return None
