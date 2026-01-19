#!/usr/bin/env python3
"""
Test script for deepfake detection on Render.
Run this in Render's shell to test EfficientNetV2 detection.

Usage:
1. Upload test_image.png to Render (via git or file upload)
2. SSH into Render shell
3. Run: python3 test_deepfake_render.py test_image.png
"""

import sys
import os
import json

# Add dfacesearch to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'dfacesearch'))

def test_deepfake_detection(image_path):
    """Test deepfake detection and show detailed results."""
    print("=" * 70)
    print("DEEPFAKE DETECTION TEST - RENDER ENVIRONMENT")
    print("=" * 70)
    print(f"Image: {image_path}")
    print()
    
    # Check dependencies
    try:
        import tensorflow as tf
        tf_version = tf.__version__
        tf_available = True
    except ImportError:
        tf_version = "Not Available"
        tf_available = False
    
    try:
        import numpy as np
        numpy_available = True
    except ImportError:
        numpy_available = False
    
    try:
        import cv2
        opencv_available = True
    except ImportError:
        opencv_available = False
    
    try:
        from PIL import Image
        pil_available = True
    except ImportError:
        pil_available = False
    
    try:
        import keras_efficientnet_v2
        efficientnet_package = "Available"
    except ImportError:
        efficientnet_package = "Not Available (will use tf.keras fallback)"
    
    print("DEPENDENCY CHECK:")
    print(f"  • Python: {sys.version.split()[0]}")
    print(f"  • TensorFlow: {'✅ ' + tf_version if tf_available else '❌ Not Available'}")
    print(f"  • NumPy: {'✅ Available' if numpy_available else '❌ Not Available'}")
    print(f"  • OpenCV: {'✅ Available' if opencv_available else '❌ Not Available'}")
    print(f"  • Pillow: {'✅ Available' if pil_available else '❌ Not Available'}")
    print(f"  • keras-efficientnet-v2: {efficientnet_package}")
    print()
    
    if not os.path.exists(image_path):
        print(f"❌ Image not found: {image_path}")
        print()
        print("To upload image to Render:")
        print("  1. Add image to git repo and push")
        print("  2. Or use: curl -o test_image.png <image_url>")
        return
    
    # Import and test
    try:
        from deepfake_detection import detect_deepfake, is_deepfake_detection_available
    except ImportError as e:
        print(f"❌ Could not import deepfake_detection: {e}")
        print("Make sure you're in the project root directory")
        return
    
    print(f"Detection Available: {'✅ Yes' if is_deepfake_detection_available() else '❌ No'}")
    print()
    
    # Run detection
    print("RUNNING DETECTION...")
    print("-" * 70)
    
    import time
    start_time = time.time()
    result = detect_deepfake(image_path)
    elapsed_time = time.time() - start_time
    
    # Display results
    print("\n" + "=" * 70)
    print("RESULTS:")
    print("=" * 70)
    print(f"Method Used: {result.get('method', 'unknown').upper()}")
    print(f"Available: {'✅ Yes' if result.get('available') else '❌ No'}")
    print(f"Processing Time: {elapsed_time:.2f} seconds")
    print()
    
    is_deepfake = result.get('is_deepfake', False)
    confidence = result.get('confidence', 0.0)
    
    print(f"Detection Result: {'⚠️  LIKELY DEEPFAKE' if is_deepfake else '✅ Likely Real'}")
    print(f"Confidence Score: {confidence:.1%}")
    print()
    
    details = result.get('details', {})
    if details:
        print("Detailed Analysis:")
        print("-" * 70)
        
        if result.get('method') == 'efficientnet_v2':
            print("🔬 EfficientNetV2 Feature Analysis:")
            if 'indicators' in details:
                indicators = details['indicators']
                if indicators:
                    print(f"  • Indicators Detected: {len(indicators)}")
                    for indicator in indicators:
                        print(f"    - {indicator}")
                else:
                    print("  • No indicators detected")
            if 'feature_mean' in details:
                print(f"  • Feature Mean: {details['feature_mean']}")
                print(f"  • Feature Std: {details['feature_std']}")
                print(f"  • Feature Range: {details.get('feature_range', 'N/A')}")
            if 'note' in details:
                print(f"  • Note: {details['note']}")
            print()
            print("✅ EfficientNetV2 is working! This provides higher accuracy.")
        
        elif result.get('method') == 'artifact_analysis':
            print("🔬 Artifact-Based Analysis (Fallback):")
            if 'artifacts_detected' in details:
                artifacts = details['artifacts_detected']
                if artifacts:
                    print(f"  • Artifacts Detected: {len(artifacts)}")
                    for artifact in artifacts:
                        print(f"    - {artifact}")
                else:
                    print("  • No significant artifacts detected")
            if 'laplacian_variance' in details:
                print(f"  • Laplacian Variance: {details['laplacian_variance']}")
            if 'note' in details:
                print(f"  • Note: {details['note']}")
            print()
            print("⚠️  Using artifact-based fallback (TensorFlow not available)")
    
    print("=" * 70)
    print("INTERPRETATION:")
    print("=" * 70)
    if is_deepfake:
        print(f"⚠️  This image shows characteristics of a deepfake (confidence: {confidence:.1%})")
        if result.get('method') == 'efficientnet_v2':
            print("   EfficientNetV2 detected feature-level inconsistencies.")
        else:
            print("   Artifact analysis detected manipulation indicators.")
    else:
        print(f"✅ This image appears to be authentic (confidence: {confidence:.1%})")
        if confidence > 0.3:
            print("   Some indicators were detected but below threshold.")
        else:
            print("   No significant deepfake indicators were found.")
    
    print()
    print("=" * 70)
    print("FULL JSON RESULT:")
    print("=" * 70)
    print(json.dumps(result, indent=2, default=str))
    
    # Summary
    print()
    print("=" * 70)
    print("SUMMARY:")
    print("=" * 70)
    if result.get('method') == 'efficientnet_v2':
        print("✅ EfficientNetV2 is working correctly on Render!")
        print("   This provides the highest accuracy for deepfake detection.")
    else:
        print("⚠️  EfficientNetV2 is not available (using artifact-based fallback)")
        print("   Check TensorFlow installation and Python version (should be 3.12 or earlier)")

if __name__ == "__main__":
    image_path = "test_image.png"
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
    
    test_deepfake_detection(image_path)
