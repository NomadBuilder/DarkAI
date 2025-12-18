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
        result["details"] = {"error": f"Image file not found: {image_path}"}
        return result
    
    # Method 1: Try EfficientNetV2-based detection (if model available)
    if TENSORFLOW_AVAILABLE and PIL_AVAILABLE:
        efficientnet_result = _detect_with_efficientnet(image_path)
        if efficientnet_result.get("available"):
            return efficientnet_result
        # Store error for debugging if EfficientNet failed
        if efficientnet_result.get("details", {}).get("error"):
            result["details"]["efficientnet_error"] = efficientnet_result["details"]["error"]
        elif efficientnet_result.get("details", {}).get("message"):
            result["details"]["efficientnet_message"] = efficientnet_result["details"]["message"]
    
    # Method 2: Fallback to artifact-based detection
    if OPENCV_AVAILABLE:
        artifact_result = _detect_with_artifacts(image_path)
        if artifact_result.get("available"):
            return artifact_result
        # Store error for debugging if artifact detection failed
        if artifact_result.get("details", {}).get("error"):
            result["details"]["artifact_error"] = artifact_result["details"]["error"]
    
    # If no methods available, return unavailable status with details
    if not result["details"]:
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
            
        except (ImportError, AttributeError) as e:
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
            except ImportError as e2:
                # TensorFlow version might not have EfficientNetV2
                print(f"⚠️  EfficientNetV2 not available: tf.keras error: {e}, keras_efficientnet_v2 error: {e2}")
                return None
                
    except Exception as e:
        print(f"⚠️  Failed to load EfficientNetV2 model: {e}")
        import traceback
        traceback.print_exc()
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
                "note": "Install keras-efficientnet-v2 or use TensorFlow 2.13+ with EfficientNetV2 support",
                "tensorflow_version": tf.__version__ if TENSORFLOW_AVAILABLE else "not available"
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
        
        # Calculate basic statistics
        feature_mean = float(np.mean(features_flat))
        feature_std = float(np.std(features_flat))
        feature_max = float(np.max(features_flat))
        feature_min = float(np.min(features_flat))
        feature_median = float(np.median(features_flat))
        
        # Calculate advanced statistics
        # Feature entropy (measure of randomness/unpredictability)
        # Normalize features to [0, 1] for entropy calculation
        feature_range = feature_max - feature_min
        if feature_range > 1e-10:
            features_normalized = (features_flat - feature_min) / feature_range
            features_normalized = np.clip(features_normalized, 0, 1)
            # Create histogram for entropy
            hist, _ = np.histogram(features_normalized, bins=50, range=(0, 1))
            hist = hist + 1e-10  # Avoid log(0)
            hist = hist / np.sum(hist)  # Normalize
            feature_entropy = float(-np.sum(hist * np.log2(hist)))
        else:
            # All features are the same, entropy is 0
            feature_entropy = 0.0
        
        # Outlier analysis (using IQR method)
        q1 = float(np.percentile(features_flat, 25))
        q3 = float(np.percentile(features_flat, 75))
        iqr = q3 - q1
        if iqr > 1e-10:
            outlier_threshold_low = q1 - 1.5 * iqr
            outlier_threshold_high = q3 + 1.5 * iqr
            outlier_count = float(np.sum((features_flat < outlier_threshold_low) | (features_flat > outlier_threshold_high)))
            outlier_ratio = outlier_count / len(features_flat)
        else:
            # No IQR, use standard deviation method instead
            outlier_threshold_low = feature_mean - 3 * feature_std
            outlier_threshold_high = feature_mean + 3 * feature_std
            outlier_count = float(np.sum((features_flat < outlier_threshold_low) | (features_flat > outlier_threshold_high)))
            outlier_ratio = outlier_count / len(features_flat)
        
        # Distribution shape analysis
        # Skewness (asymmetry) and Kurtosis (tail heaviness)
        if feature_std > 1e-10:
            normalized_features = (features_flat - feature_mean) / feature_std
            feature_skew = float(np.mean(normalized_features ** 3))
            feature_kurtosis = float(np.mean(normalized_features ** 4) - 3)
        else:
            # No variance, so no skewness or kurtosis
            feature_skew = 0.0
            feature_kurtosis = 0.0
        
        # Feature consistency (if features have spatial dimensions)
        if len(features.shape) > 2 and features.shape[1] > 1 and features.shape[2] > 1:
            try:
                # Calculate spatial variance (inconsistency across spatial locations)
                spatial_variance = float(np.mean(np.std(features, axis=(1, 2))))
                # Calculate feature map smoothness (gradient magnitude)
                # Calculate gradients in spatial dimensions
                grad_x = np.diff(features, axis=2)
                grad_y = np.diff(features, axis=1)
                # Handle dimension mismatch
                min_h = min(grad_x.shape[1], grad_y.shape[1])
                min_w = min(grad_x.shape[2], grad_y.shape[2])
                gradient_magnitude = float(np.mean(np.sqrt(
                    grad_x[:, :min_h, :min_w]**2 + grad_y[:, :min_h, :min_w]**2
                )))
            except Exception:
                spatial_variance = None
                gradient_magnitude = None
        else:
            spatial_variance = None
            gradient_magnitude = None
        
        # Feature correlation analysis (if we have multiple feature maps)
        if len(features.shape) > 1 and features.shape[0] > 1:
            try:
                # Flatten each feature map and calculate correlation
                feature_maps = features.reshape(features.shape[0], -1)
                if feature_maps.shape[0] > 1 and feature_maps.shape[1] > 1:
                    # Calculate pairwise correlations
                    correlations = np.corrcoef(feature_maps)
                    # Remove diagonal (self-correlation)
                    if correlations.shape[0] > 1:
                        mask = ~np.eye(correlations.shape[0], dtype=bool)
                        avg_correlation = float(np.mean(correlations[mask]))
                        correlation_std = float(np.std(correlations[mask]))
                    else:
                        avg_correlation = None
                        correlation_std = None
                else:
                    avg_correlation = None
                    correlation_std = None
            except Exception:
                avg_correlation = None
                correlation_std = None
        else:
            avg_correlation = None
            correlation_std = None
        
        # Heuristic: Deepfakes often have:
        # - Higher variance in features (inconsistent patterns)
        # - Extreme feature values (outliers)
        # - Unusual feature distributions
        # - Low entropy (less natural variation)
        # - High outlier ratio (anomalous values)
        # - Unusual distribution shapes (high skewness/kurtosis)
        # - Inconsistent spatial patterns
        # - Unusual feature correlations
        
        confidence_score = 0.0
        indicators = []
        indicator_details = {}
        
        # Check 1: High feature variance (inconsistent patterns)
        if feature_std > 0.5:
            indicators.append("high_feature_variance")
            confidence_score += 0.15
            indicator_details["high_feature_variance"] = round(feature_std, 4)
        
        # Check 2: Extreme feature values (outliers)
        if abs(feature_max) > 10 or abs(feature_min) < -10:
            indicators.append("extreme_feature_values")
            confidence_score += 0.12
            indicator_details["extreme_feature_values"] = f"max={round(feature_max, 2)}, min={round(feature_min, 2)}"
        
        # Check 3: Unusual feature distribution (skewed)
        if abs(feature_mean - feature_median) > 0.3:
            indicators.append("skewed_distribution")
            confidence_score += 0.10
            indicator_details["skewed_distribution"] = round(abs(feature_mean - feature_median), 4)
        
        # Check 4: Feature sparsity (many zero or near-zero features)
        zero_features = float(np.sum(np.abs(features_flat) < 0.01)) / len(features_flat)
        if zero_features > 0.3:
            indicators.append("high_sparsity")
            confidence_score += 0.08
            indicator_details["high_sparsity"] = f"{zero_features:.1%}"
        
        # Check 5: Low entropy (unnatural feature distribution)
        # Real images typically have higher entropy (more natural variation)
        # Deepfakes may have lower entropy due to generation artifacts
        if feature_entropy < 4.0:  # Threshold based on typical image entropy
            indicators.append("low_entropy")
            confidence_score += 0.12
            indicator_details["low_entropy"] = round(feature_entropy, 4)
        
        # Check 6: High outlier ratio (anomalous values)
        if outlier_ratio > 0.15:  # More than 15% outliers
            indicators.append("high_outlier_ratio")
            confidence_score += 0.10
            indicator_details["high_outlier_ratio"] = f"{outlier_ratio:.1%}"
        
        # Check 7: Unusual distribution shape (high skewness)
        if abs(feature_skew) > 2.0:  # Highly skewed distribution
            indicators.append("high_skewness")
            confidence_score += 0.08
            indicator_details["high_skewness"] = round(feature_skew, 4)
        
        # Check 8: Unusual distribution shape (high kurtosis - heavy tails)
        if feature_kurtosis > 5.0:  # Heavy-tailed distribution
            indicators.append("high_kurtosis")
            confidence_score += 0.08
            indicator_details["high_kurtosis"] = round(feature_kurtosis, 4)
        
        # Check 9: Spatial inconsistency (if spatial dimensions exist)
        if spatial_variance is not None and spatial_variance > 0.8:
            indicators.append("spatial_inconsistency")
            confidence_score += 0.10
            indicator_details["spatial_inconsistency"] = round(spatial_variance, 4)
        
        # Check 10: Unusual feature correlations
        if avg_correlation is not None:
            # Deepfakes might have either very low (inconsistent) or very high (over-regularized) correlations
            if avg_correlation < 0.1 or avg_correlation > 0.9:
                indicators.append("unusual_correlations")
                confidence_score += 0.08
                indicator_details["unusual_correlations"] = round(avg_correlation, 4)
        
        # Check 11: High gradient magnitude (unnatural transitions)
        if gradient_magnitude is not None and gradient_magnitude > 2.0:
            indicators.append("high_gradient_magnitude")
            confidence_score += 0.08
            indicator_details["high_gradient_magnitude"] = round(gradient_magnitude, 4)
        
        # Normalize confidence (cap at 1.0)
        confidence_score = min(confidence_score, 1.0)
        
        # Threshold: > 0.35 indicates likely deepfake
        # Adjusted threshold based on more comprehensive indicators
        is_deepfake = confidence_score > 0.35
        
        # Build details dictionary
        details = {
            "indicators": indicators,
            "indicator_details": indicator_details,
            "feature_statistics": {
                "mean": round(feature_mean, 4),
                "std": round(feature_std, 4),
                "median": round(feature_median, 4),
                "range": f"{round(feature_min, 2)} to {round(feature_max, 2)}",
                "entropy": round(feature_entropy, 4),
                "skewness": round(feature_skew, 4),
                "kurtosis": round(feature_kurtosis, 4),
                "outlier_ratio": f"{outlier_ratio:.1%}"
            }
        }
        
        # Add spatial analysis if available
        if spatial_variance is not None:
            details["spatial_analysis"] = {
                "spatial_variance": round(spatial_variance, 4)
            }
            if gradient_magnitude is not None:
                details["spatial_analysis"]["gradient_magnitude"] = round(gradient_magnitude, 4)
        
        # Add correlation analysis if available
        if avg_correlation is not None:
            details["correlation_analysis"] = {
                "avg_correlation": round(avg_correlation, 4),
                "correlation_std": round(correlation_std, 4) if correlation_std is not None else None
            }
        
        details["note"] = "Using EfficientNetV2 feature extraction with comprehensive heuristic analysis"
        
        result.update({
            "is_deepfake": is_deepfake,
            "confidence": round(confidence_score, 3),
            "available": True,
            "details": details
        })
        
        return result
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        result["details"] = {
            "error": str(e),
            "error_type": type(e).__name__,
            "traceback": error_trace
        }
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
