# Testing Deepfake Detection on Render

This guide shows you how to test EfficientNetV2 deepfake detection on Render's production environment.

## Quick Test Commands

### Option 1: Upload Image via Git (Recommended)

1. **Add your test image to the repo:**
   ```bash
   # Locally
   cp /path/to/your/image.png test_image.png
   git add test_image.png
   git commit -m "Add test image for deepfake detection"
   git push origin main
   ```

2. **SSH into Render shell:**
   - Go to Render Dashboard → Your Service → Shell
   - Or use: `ssh <your-render-service>`

3. **Run the test:**
   ```bash
   cd /opt/render/project/src
   python3 test_deepfake_render.py test_image.png
   ```

### Option 2: Upload Image via curl (Quick Test)

1. **SSH into Render shell**

2. **Download your image:**
   ```bash
   cd /opt/render/project/src
   # Upload your image to a temporary host (imgur, etc.) and download:
   curl -o test_image.png "https://i.imgur.com/YOUR_IMAGE_ID.png"
   ```

3. **Run the test:**
   ```bash
   python3 test_deepfake_render.py test_image.png
   ```

### Option 3: Use Base64 (Small Images Only)

1. **SSH into Render shell**

2. **Create image from base64:**
   ```bash
   cd /opt/render/project/src
   # Paste your base64 encoded image
   echo "YOUR_BASE64_STRING" | base64 -d > test_image.png
   ```

3. **Run the test:**
   ```bash
   python3 test_deepfake_render.py test_image.png
   ```

## What to Expect

### If EfficientNetV2 Works (Expected on Render):
```
Method Used: EFFICIENTNET_V2
Detection Result: ⚠️  LIKELY DEEPFAKE (or ✅ Likely Real)
Confidence Score: X.X%
Processing Time: 1-3 seconds (first run slower due to model loading)

Detailed Analysis:
🔬 EfficientNetV2 Feature Analysis:
  • Indicators Detected: X
    - high_feature_variance
    - skewed_distribution
  • Feature Mean: X.XXXX
  • Feature Std: X.XXXX
```

### If Using Fallback (Artifact Analysis):
```
Method Used: ARTIFACT_ANALYSIS
⚠️  Using artifact-based fallback (TensorFlow not available)
```

## Troubleshooting

### Check Python Version:
```bash
python3 --version
# Should be 3.11.0 or 3.12.x (per runtime.txt)
```

### Check TensorFlow Installation:
```bash
python3 -c "import tensorflow as tf; print(tf.__version__)"
# Should print version like 2.13.0 or higher
```

### Check if Dependencies are Installed:
```bash
python3 -c "import numpy, cv2, PIL; print('All dependencies OK')"
```

### Check Project Structure:
```bash
cd /opt/render/project/src
ls -la dfacesearch/deepfake_detection.py
# Should exist
```

## Expected Results for Your Test Image

Since your test image is from an AI porn site (known deepfake):

**With EfficientNetV2 (Expected):**
- Method: `efficientnet_v2`
- Detection: ⚠️ **LIKELY DEEPFAKE**
- Confidence: Should be > 40% (likely 50-70%)
- Indicators: Should show feature-level inconsistencies

**With Artifact Analysis (Fallback):**
- Method: `artifact_analysis`
- Detection: ✅ Likely Real (false negative - this is why we need EfficientNetV2!)
- Confidence: ~20% (missed the deepfake)

## Quick One-Liner Test

If you just want to quickly test if EfficientNetV2 is working:

```bash
cd /opt/render/project/src && python3 -c "import sys; sys.path.insert(0, 'dfacesearch'); from deepfake_detection import TENSORFLOW_AVAILABLE; print('EfficientNetV2 available' if TENSORFLOW_AVAILABLE else 'Using artifact fallback')"
```

**Note:** Avoid using `!` characters in bash commands as they trigger history expansion. The command above avoids this issue.

## After Testing

Once you've confirmed EfficientNetV2 works, you can remove the test image:

```bash
# In Render shell
rm test_image.png

# Or remove from git (locally)
git rm test_image.png
git commit -m "Remove test image"
git push
```
