#!/usr/bin/env python3
"""
Test script to compare deepfake detection methods.
"""

import sys
import os
import json

# Add dfacesearch to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'dfacesearch'))

from deepfake_detection import detect_deepfake, is_deepfake_detection_available, TENSORFLOW_AVAILABLE, OPENCV_AVAILABLE, NUMPY_AVAILABLE

def test_deepfake_detection(image_path):
    """Test deepfake detection on an image and show detailed comparison."""
    print("=" * 70)
    print("DEEPFAKE DETECTION TEST - COMPARISON")
    print("=" * 70)
    print(f"Image: {image_path}")
    print()
    
    # Check dependencies
    print("DEPENDENCY CHECK:")
    print(f"  • TensorFlow: {'✅ Available' if TENSORFLOW_AVAILABLE else '❌ Not Available'}")
    print(f"  • OpenCV: {'✅ Available' if OPENCV_AVAILABLE else '❌ Not Available'}")
    print(f"  • NumPy: {'✅ Available' if NUMPY_AVAILABLE else '❌ Not Available'}")
    print(f"  • Detection Available: {'✅ Yes' if is_deepfake_detection_available() else '❌ No'}")
    print()
    
    if not os.path.exists(image_path):
        print(f"❌ Image not found: {image_path}")
        return
    
    # Run detection
    print("RUNNING DETECTION...")
    print("-" * 70)
    result = detect_deepfake(image_path)
    
    # Display results
    print("\n" + "=" * 70)
    print("RESULTS:")
    print("=" * 70)
    print(f"Method Used: {result.get('method', 'unknown').upper()}")
    print(f"Available: {'✅ Yes' if result.get('available') else '❌ No'}")
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
                print(f"  • Indicators Detected: {len(details['indicators'])}")
                for indicator in details.get('indicators', []):
                    print(f"    - {indicator}")
            if 'feature_mean' in details:
                print(f"  • Feature Mean: {details['feature_mean']}")
                print(f"  • Feature Std: {details['feature_std']}")
                print(f"  • Feature Range: {details.get('feature_range', 'N/A')}")
            if 'note' in details:
                print(f"  • Note: {details['note']}")
        
        elif result.get('method') == 'artifact_analysis':
            print("🔬 Artifact-Based Analysis:")
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
                print(f"    (Lower = more compression/artifacts)")
            if 'edge_density' in details:
                print(f"  • Edge Density: {details['edge_density']:.4f}")
            if 'saturation_std' in details:
                print(f"  • Saturation Std: {details['saturation_std']:.2f}")
            if 'note' in details:
                print(f"  • Note: {details['note']}")
        
        if 'error' in details:
            print(f"\n❌ Error: {details['error']}")
        elif 'message' in details:
            print(f"\nℹ️  Message: {details['message']}")
    
    print("\n" + "=" * 70)
    print("INTERPRETATION:")
    print("=" * 70)
    if is_deepfake:
        print(f"⚠️  This image shows characteristics of a deepfake (confidence: {confidence:.1%})")
        print("   The detection method identified indicators suggesting manipulation.")
    else:
        print(f"✅ This image appears to be authentic (confidence: {confidence:.1%})")
        if confidence > 0.3:
            print("   Some artifacts were detected but below the threshold for deepfake classification.")
        else:
            print("   No significant deepfake indicators were found.")
    
    print()
    print("=" * 70)
    print("FULL JSON RESULT:")
    print("=" * 70)
    print(json.dumps(result, indent=2, default=str))
    
    print("\n" + "=" * 70)
    print("COMPARISON WITH EARLIER RUN:")
    print("=" * 70)
    print("Earlier Run (Artifact-Based):")
    print("  • Method: artifact_analysis")
    print("  • Confidence: 20.0%")
    print("  • Result: Likely Real")
    print("  • Artifacts: high_compression")
    print()
    print("Current Run:")
    print(f"  • Method: {result.get('method')}")
    print(f"  • Confidence: {confidence:.1%}")
    print(f"  • Result: {'Likely Deepfake' if is_deepfake else 'Likely Real'}")
    if result.get('method') == 'artifact_analysis':
        print("  • Artifacts:", ', '.join(details.get('artifacts_detected', [])))
    print()
    if result.get('method') == 'efficientnet_v2':
        print("✅ EfficientNetV2 is now working! This provides higher accuracy than artifact-based detection.")
    else:
        print("ℹ️  Using artifact-based detection (TensorFlow not available on Python 3.14.2)")
        print("   On Render (Python 3.11.0), EfficientNetV2 will be used automatically.")

if __name__ == "__main__":
    image_path = "test_image.png"
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
    
    test_deepfake_detection(image_path)
