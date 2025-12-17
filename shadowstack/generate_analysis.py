#!/usr/bin/env python3
"""
Generate static analysis HTML for ShadowStack.
Run this script to pre-generate the analysis HTML file.
"""

import os
import sys
from pathlib import Path

# Add paths for imports
project_root = Path(__file__).parent.parent
shadowstack_dir = Path(__file__).parent
sys.path.insert(0, str(project_root))
sys.path.insert(0, str(shadowstack_dir))

# Import Flask app to get blueprint functions
from app import app

def generate_static_analysis():
    """Generate analysis and save as static HTML file."""
    print("🔄 Generating ShadowStack analysis...")
    
    with app.app_context():
        try:
            # Call the analysis generation endpoint logic
            from shadowstack.blueprint import get_ai_analysis
            from flask import request
            
            # Create a mock request with force=true
            with app.test_request_context('/shadowstack/api/analysis?force=true'):
                response = get_ai_analysis()
                
                # Get JSON data from response
                import json
                # Response might be a tuple (response, status_code) or just response
                if isinstance(response, tuple):
                    response_obj = response[0]
                else:
                    response_obj = response
                
                if hasattr(response_obj, 'get_json'):
                    data = response_obj.get_json()
                elif hasattr(response_obj, 'data'):
                    data = json.loads(response_obj.data)
                else:
                    data = json.loads(response_obj)
                
                if data.get('error'):
                    print(f"❌ Error: {data['error']}")
                    return False
                
                # Get analysis HTML (it's markdown, convert to HTML)
                analysis_markdown = data.get('analysis', '')
                
                # Convert markdown to HTML
                import re
                def markdown_to_html(text):
                    if not text:
                        return ''
                    # Headers
                    text = re.sub(r'^### (.*)$', r'<h3>\1</h3>', text, flags=re.MULTILINE)
                    text = re.sub(r'^## (.*)$', r'<h2>\1</h2>', text, flags=re.MULTILINE)
                    text = re.sub(r'^#### (.*)$', r'<h4>\1</h4>', text, flags=re.MULTILINE)
                    # Bold
                    text = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', text)
                    # Lists - handle bullet points
                    lines = text.split('\n')
                    html_lines = []
                    in_list = False
                    for line in lines:
                        if line.strip().startswith('- '):
                            if not in_list:
                                html_lines.append('<ul>')
                                in_list = True
                            html_lines.append(f'<li>{line.strip()[2:]}</li>')
                        else:
                            if in_list:
                                html_lines.append('</ul>')
                                in_list = False
                            if line.strip() and not line.strip().startswith('#'):
                                html_lines.append(f'<p>{line.strip()}</p>')
                            elif line.strip():
                                html_lines.append(line)
                    if in_list:
                        html_lines.append('</ul>')
                    return '\n'.join(html_lines)
                
                html_content = markdown_to_html(analysis_markdown)
                
                # Add IMPORTANT notice at top
                html_content = f"""
                <p><strong>IMPORTANT:</strong> Service providers (CDNs, hosts, ISPs) are being paid to enable these sites and should be held accountable, even if they're acting as intermediaries like Cloudflare.</p>
                {html_content}
                """
                
                # Save to static file
                output_dir = shadowstack_dir / 'static' / 'data'
                output_dir.mkdir(parents=True, exist_ok=True)
                output_file = output_dir / 'analysis.html'
                
                with open(output_file, 'w', encoding='utf-8') as f:
                    f.write(html_content)
                
                print(f"✅ Analysis saved to: {output_file}")
                print(f"   Total domains analyzed: {data.get('bad_actors', {}).get('top_service_providers', [{}])[0].get('count', 'N/A') if data.get('bad_actors', {}).get('top_service_providers') else 'N/A'}")
                
                return True
                
        except Exception as e:
            print(f"❌ Error generating analysis: {e}")
            import traceback
            traceback.print_exc()
            return False

if __name__ == '__main__':
    success = generate_static_analysis()
    sys.exit(0 if success else 1)
