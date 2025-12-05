#!/usr/bin/env python3
"""
Production Readiness Verification Script

Run this before deploying to Render to ensure everything is configured correctly.
"""

import os
import sys
import re
from pathlib import Path

def check_hardcoded_localhost():
    """Check for hardcoded localhost references."""
    print("🔍 Checking for hardcoded localhost references...")
    issues = []
    
    # Files to check
    files_to_check = [
        "app.py",
        "personaforge/blueprint.py",
        "personaforge/src/database/postgres_client.py",
        "personaforge/src/enrichment/enrichment_pipeline.py",
    ]
    
    for file_path in files_to_check:
        if not os.path.exists(file_path):
            continue
        with open(file_path, 'r') as f:
            content = f.read()
            # Check for hardcoded localhost (but allow in comments or config defaults)
            matches = re.findall(r'(?<!["\'])(?:localhost|127\.0\.0\.1|:5000|:5001)(?!["\'])', content)
            # Filter out comments and acceptable defaults
            for match in matches:
                if 'localhost' in match or '127.0.0.1' in match:
                    # Check if it's in a comment or acceptable default
                    if not any(keyword in content[max(0, content.find(match)-50):content.find(match)] 
                              for keyword in ['#', 'default', 'fallback', 'example']):
                        issues.append(f"{file_path}: Found hardcoded {match}")
    
    if issues:
        print("  ❌ Issues found:")
        for issue in issues:
            print(f"     {issue}")
        return False
    else:
        print("  ✅ No hardcoded localhost references found")
        return True

def check_environment_variables():
    """Check that environment variables are properly used."""
    print("\n🔍 Checking environment variable usage...")
    
    # Check that DATABASE_URL is handled
    with open("personaforge/src/database/postgres_client.py", 'r') as f:
        content = f.read()
        if "DATABASE_URL" in content and "os.getenv" in content:
            print("  ✅ DATABASE_URL is properly handled")
        else:
            print("  ❌ DATABASE_URL handling may be missing")
            return False
    
    # Check that PORT is used
    with open("app.py", 'r') as f:
        content = f.read()
        if "os.getenv('PORT'" in content or "os.getenv(\"PORT\"" in content:
            print("  ✅ PORT environment variable is used")
        else:
            print("  ❌ PORT environment variable not found")
            return False
    
    return True

def check_database_ssl():
    """Check that SSL is configured for Render databases."""
    print("\n🔍 Checking database SSL configuration...")
    
    with open("personaforge/src/database/postgres_client.py", 'r') as f:
        content = f.read()
        if "render.com" in content and "sslmode" in content:
            print("  ✅ SSL mode configured for Render databases")
            return True
        else:
            print("  ⚠️  SSL configuration may be missing for Render")
            return False

def check_requirements():
    """Check that requirements.txt exists and is valid."""
    print("\n🔍 Checking requirements.txt...")
    
    if not os.path.exists("requirements.txt"):
        print("  ❌ requirements.txt not found")
        return False
    
    with open("requirements.txt", 'r') as f:
        lines = f.readlines()
        required_packages = [
            "flask",
            "psycopg2",
            "python-dotenv",
        ]
        
        content = ''.join(lines)
        missing = []
        for package in required_packages:
            if package.lower() not in content.lower():
                missing.append(package)
        
        if missing:
            print(f"  ⚠️  Potentially missing packages: {', '.join(missing)}")
        else:
            print("  ✅ requirements.txt looks good")
    
    return True

def check_render_yaml():
    """Check that render.yaml is properly configured."""
    print("\n🔍 Checking render.yaml...")
    
    if not os.path.exists("render.yaml"):
        print("  ❌ render.yaml not found")
        return False
    
    with open("render.yaml", 'r') as f:
        content = f.read()
        
        checks = [
            ("FLASK_ENV", "production"),
            ("POSTGRES_HOST", "fromDatabase"),
            ("gunicorn", "startCommand"),
            ("PORT", "$PORT"),
        ]
        
        all_good = True
        for check_key, check_value in checks:
            if check_value in content:
                print(f"  ✅ {check_key} properly configured")
            else:
                print(f"  ⚠️  {check_key} configuration may be missing")
                all_good = False
    
    return all_good

def check_neo4j_optional():
    """Check that Neo4j is optional."""
    print("\n🔍 Checking Neo4j configuration...")
    
    with open("personaforge/src/database/neo4j_client.py", 'r') as f:
        content = f.read()
        if "SKIP_NEO4J" in content:
            print("  ✅ Neo4j can be skipped with SKIP_NEO4J=1")
            return True
        else:
            print("  ⚠️  Neo4j skip option may not be available")
            return False

def check_static_files():
    """Check that static files are properly referenced."""
    print("\n🔍 Checking static file references...")
    
    # Check templates for static file references
    template_files = list(Path("templates").glob("*.html"))
    issues = []
    
    for template_file in template_files[:5]:  # Check first 5 templates
        with open(template_file, 'r') as f:
            content = f.read()
            # Check for absolute paths that might not work
            if re.search(r'src=["\']/[^/]', content):
                issues.append(f"{template_file}: May have absolute path issues")
    
    if issues:
        print("  ⚠️  Potential static file path issues:")
        for issue in issues:
            print(f"     {issue}")
    else:
        print("  ✅ Static file references look good")
    
    return len(issues) == 0

def main():
    print("=" * 60)
    print("Production Readiness Verification")
    print("=" * 60)
    print()
    
    checks = [
        ("Hardcoded localhost", check_hardcoded_localhost),
        ("Environment variables", check_environment_variables),
        ("Database SSL", check_database_ssl),
        ("Requirements.txt", check_requirements),
        ("Render.yaml", check_render_yaml),
        ("Neo4j optional", check_neo4j_optional),
        ("Static files", check_static_files),
    ]
    
    results = []
    for name, check_func in checks:
        try:
            result = check_func()
            results.append((name, result))
        except Exception as e:
            print(f"  ❌ Error checking {name}: {e}")
            results.append((name, False))
    
    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    
    all_passed = True
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {name}")
        if not result:
            all_passed = False
    
    print()
    if all_passed:
        print("✅ All checks passed! Ready for production deployment.")
        print("\nNext steps:")
        print("1. Set SKIP_NEO4J=1 in Render environment variables (if Neo4j not available)")
        print("2. Verify database is linked in Render dashboard")
        print("3. Push to GitHub and let Render deploy")
        print("4. Check Render logs after deployment")
    else:
        print("⚠️  Some checks failed. Please review and fix before deploying.")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())

