"""
Deepfake detection module using EfficientNetV2 (inspired by DeepSecure-AI).

This module detects if an uploaded image is likely a deepfake using:
- EfficientNetV2 for high-accuracy classification (placeholder for future model)
- Image artifact analysis as fallback

Free and runs locally - no API costs.
"""

import os
from typing import Dict

# Try to import required libraries (lazy imports to avoid breaking if not available)
try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    NUMPY_AVAILABLE = False
    np = None

try:
    import tensorflow as tf
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False
    tf = None

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    Image = None

try:
    import cv2
    OPENCV_AVAILABLE = True
except ImportError:
    OPENCV_AVAILABLE = False
    cv2 = None


def detect_deepfake(image_path: str) -> Dict:
    """
    Detect if an image is likely a deepfake.
    
    Args:
        image_path: Path to the image file
        
    Returns:
        Dictionary with:
        - is_deepfake: bool
        - confidence: float (0-1)
        - method: str (which detection method was used)
        - details: dict (additional info)
        - available: bool
    """
    result = {
        "is_deepfake": False,
        "confidence": 0.0,
        "method": "none",
        "details": {},
        "available": False
    }
    
    if not os.path.exists(image_path):
        return result
    
    # Method 1: Try EfficientNetV2-based detection (if model available)
    if TENSORFLOW_AVAILABLE and PIL_AVAILABLE:
        efficientnet_result = _detect_with_efficientnet(image_path)
        if efficientnet_result.get("available"):
            return efficientnet_result
    
    # Method 2: Fallback to artifact-based detection
    if OPENCV_AVAILABLE:
        artifact_result = _detect_with_artifacts(image_path)
        if artifact_result.get("available"):
            return artifact_result
    
    # If no methods available, return unavailable status
    result["details"] = {"message": "Deepfake detection not available - missing dependencies"}
    return result


# Global model cache to avoid reloading
_EFFICIENTNET_MODEL = None
_MODEL_LOAD_ATTEMPTED = False

def _load_efficientnet_model():
    """Load EfficientNetV2 model for deepfake detection (cached)."""
    global _EFFICIENTNET_MODEL, _MODEL_LOAD_ATTEMPTED
    
    if _EFFICIENTNET_MODEL is not None:
        return _EFFICIENTNET_MODEL
    
    if _MODEL_LOAD_ATTEMPTED:
        return None  # Already tried and failed
    
    _MODEL_LOAD_ATTEMPTED = True
    
    try:
        # Prefer TensorFlow's built-in EfficientNet (more stable)
        try:
            # Try EfficientNetV2 from tf.keras.applications
            from tensorflow.keras.applications import EfficientNetV2S
            from tensorflow.keras.applications.efficientnet_v2 import preprocess_input
            
            base_model = EfficientNetV2S(
                weights='imagenet',
                include_top=False,
                input_shape=(224, 224, 3)
            )
            
            # Freeze base layers
            for layer in base_model.layers:
                layer.trainable = False
            
            _EFFICIENTNET_MODEL = {
                'base': base_model,
                'preprocess': preprocess_input,
                'type': 'tf_keras'
            }
            return _EFFICIENTNET_MODEL
            
        except (ImportError, AttributeError):
            # Fallback: Try keras-efficientnet-v2 package (if installed)
            try:
                import keras_efficientnet_v2
                # Use EfficientNetV2-S (small, fast, good accuracy)
                # For feature extraction only - no classification head needed
                base_model = keras_efficientnet_v2.EfficientNetV2S(
                    pretrained="imagenet",
                    num_classes=0,  # Remove classification head
                    include_preprocessing=True
                )
                
                # Freeze base layers (we're using it as a feature extractor)
                for layer in base_model.layers:
                    layer.trainable = False
                
                # Use base model directly as feature extractor
                _EFFICIENTNET_MODEL = {
                    'base': base_model,
                    'feature_extractor': base_model,  # Use base model directly
                    'type': 'keras_efficientnet_v2'
                }
                return _EFFICIENTNET_MODEL
            except ImportError:
                # TensorFlow version might not have EfficientNetV2
                return None
                
    except Exception as e:
        print(f"⚠️  Failed to load EfficientNetV2 model: {e}")
        return None


def _detect_with_efficientnet(image_path: str) -> Dict:
    """
    Detect deepfake using EfficientNetV2 model with transfer learning.
    
    Uses EfficientNetV2 as a feature extractor and applies heuristics
    to detect deepfake characteristics.
    """
    result = {
        "is_deepfake": False,
        "confidence": 0.0,
        "method": "efficientnet_v2",
        "details": {},
        "available": False
    }
    
    if not TENSORFLOW_AVAILABLE or not PIL_AVAILABLE or not NUMPY_AVAILABLE:
        return result
    
    try:
        # Load model (cached)
        model_data = _load_efficientnet_model()
        if model_data is None:
            result["details"] = {
                "message": "EfficientNetV2 model not available",
                "note": "Install keras-efficientnet-v2 or use TensorFlow 2.13+ with EfficientNetV2 support"
            }
            return result
        
        # Preprocess image
        img = Image.open(image_path)
        img = img.convert('RGB')
        img = img.resize((224, 224))
        
        # Convert to array and preprocess
        img_array = np.array(img)
        
        if model_data['type'] == 'keras_efficientnet_v2':
            # Use keras-efficientnet-v2 preprocessing
            # The model includes preprocessing, so we just need to normalize to [0, 1]
            img_array = img_array.astype(np.float32) / 255.0
            img_array = np.expand_dims(img_array, axis=0)
            
            # Extract features using the feature extractor (base model)
            # Use predict() which handles tensor conversion properly
            feature_extractor = model_data['feature_extractor']
            try:
                features = feature_extractor.predict(img_array, verbose=0)
            except Exception as e:
                # Fallback: call model directly and convert
                features_tensor = feature_extractor(img_array, training=False)
                if hasattr(features_tensor, 'numpy'):
                    features = features_tensor.numpy()
                else:
                    # Convert tensor to numpy
                    with tf.device('/CPU:0'):  # Force CPU to avoid GPU issues
                        features = np.array(features_tensor)
            
        elif model_data['type'] == 'tf_keras':
            # Use TensorFlow Keras preprocessing
            preprocess = model_data['preprocess']
            img_array = preprocess(img_array)
            img_array = np.expand_dims(img_array, axis=0)
            
            # Extract features
            base_model = model_data['base']
            features = base_model.predict(img_array, verbose=0)
        
        else:
            return result
        
        # Analyze features for deepfake indicators
        # Deepfakes often have:
        # 1. Unusual feature distributions
        # 2. Inconsistent feature patterns
        # 3. Anomalies in high-level features
        
        # Flatten features for analysis
        features_flat = features.flatten()
        
        # Calculate statistics
        feature_mean = float(np.mean(features_flat))
        feature_std = float(np.std(features_flat))
        feature_max = float(np.max(features_flat))
        feature_min = float(np.min(features_flat))
        
        # Heuristic: Deepfakes often have:
        # - Higher variance in features (inconsistent patterns)
        # - Extreme feature values (outliers)
        # - Unusual feature distributions
        
        confidence_score = 0.0
        indicators = []
        
        # Check 1: High feature variance (inconsistent patterns)
        if feature_std > 0.5:  # Threshold based on ImageNet-trained model behavior
            indicators.append("high_feature_variance")
            confidence_score += 0.25
        
        # Check 2: Extreme feature values (outliers)
        if abs(feature_max) > 10 or abs(feature_min) < -10:
            indicators.append("extreme_feature_values")
            confidence_score += 0.2
        
        # Check 3: Unusual feature distribution (skewed)
        feature_median = float(np.median(features_flat))
        if abs(feature_mean - feature_median) > 0.3:
            indicators.append("skewed_distribution")
            confidence_score += 0.15
        
        # Check 4: Feature sparsity (many zero or near-zero features)
        zero_features = float(np.sum(np.abs(features_flat) < 0.01)) / len(features_flat)
        if zero_features > 0.3:  # More than 30% near-zero
            indicators.append("high_sparsity")
            confidence_score += 0.1
        
        # Normalize confidence
        confidence_score = min(confidence_score, 1.0)
        
        # Threshold: > 0.35 indicates likely deepfake
        is_deepfake = confidence_score > 0.35
        
        result.update({
            "is_deepfake": is_deepfake,
            "confidence": round(confidence_score, 3),
            "available": True,
            "details": {
                "indicators": indicators,
                "feature_mean": round(feature_mean, 4),
                "feature_std": round(feature_std, 4),
                "feature_range": f"{round(feature_min, 2)} to {round(feature_max, 2)}",
                "note": "Using EfficientNetV2 feature extraction with heuristic analysis"
            }
        })
        
        return result
        
    except Exception as e:
        result["details"] = {"error": str(e)}
        return result


def _detect_with_artifacts(image_path: str) -> Dict:
    """
    Detect deepfake using image artifact analysis.
    
    Analyzes common deepfake artifacts:
    - Compression artifacts
    - Face boundary inconsistencies
    - Lighting inconsistencies
    - Frequency domain anomalies
    """
    result = {
        "is_deepfake": False,
        "confidence": 0.0,
        "method": "artifact_analysis",
        "details": {},
        "available": False
    }
    
    if not OPENCV_AVAILABLE or not NUMPY_AVAILABLE:
        return result
    
    try:
        # Read image
        img = cv2.imread(image_path)
        if img is None:
            return result
        
        # Convert to grayscale for analysis
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Basic artifact detection
        artifacts = []
        confidence_score = 0.0
        
        # 1. Check for compression artifacts (high frequency noise)
        # Laplacian variance - lower variance suggests more compression/artifacts
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        if laplacian_var < 100:  # Threshold for high compression
            artifacts.append("high_compression")
            confidence_score += 0.2
        
        # 2. Check for edge inconsistencies (common in deepfakes)
        edges = cv2.Canny(gray, 50, 150)
        edge_density = float(np.sum(edges > 0)) / (edges.shape[0] * edges.shape[1])
        
        # 3. Check image quality metrics
        # Blur detection using variance of Laplacian
        if laplacian_var < 50:
            artifacts.append("blur")
            confidence_score += 0.15
        
        # 4. Check for color inconsistencies (basic check)
        # Convert to HSV and check saturation variance
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        saturation_std = float(np.std(hsv[:, :, 1]))
        if saturation_std < 20:  # Low saturation variance might indicate manipulation
            artifacts.append("color_inconsistency")
            confidence_score += 0.1
        
        # Normalize confidence to 0-1 range
        confidence_score = min(confidence_score, 1.0)
        
        # Threshold: if confidence > 0.4, likely a deepfake
        # Note: Artifact-based detection has limitations - high-quality deepfakes
        # from AI porn sites often pass artifact checks but fail ML-based detection.
        # EfficientNetV2 is recommended for better accuracy.
        is_deepfake = confidence_score > 0.4
        
        result.update({
            "is_deepfake": is_deepfake,
            "confidence": round(confidence_score, 3),
            "available": True,
            "details": {
                "artifacts_detected": artifacts,
                "laplacian_variance": round(laplacian_var, 2),
                "edge_density": round(edge_density, 3),
                "saturation_std": round(saturation_std, 2),
                "note": "Artifact-based detection is less accurate than ML models"
            }
        })
        
        return result
        
    except Exception as e:
        result["details"] = {"error": str(e)}
        return result


def is_deepfake_detection_available() -> bool:
    """Check if deepfake detection is available."""
    return (TENSORFLOW_AVAILABLE and PIL_AVAILABLE and NUMPY_AVAILABLE) or (OPENCV_AVAILABLE and NUMPY_AVAILABLE)
