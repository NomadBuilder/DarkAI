#!/bin/bash
# Quick test commands for Render shell - copy and paste these

# Navigate to project
cd /opt/render/project/src

# Check Python version
echo "=== Python Version ==="
python3 --version

# Check TensorFlow (avoid ! character to prevent bash history expansion)
echo ""
echo "=== TensorFlow Check ==="
python3 -c "import sys; sys.path.insert(0, 'dfacesearch'); from deepfake_detection import TENSORFLOW_AVAILABLE; print('EfficientNetV2 available' if TENSORFLOW_AVAILABLE else 'Using artifact fallback')"

# Check all dependencies
echo ""
echo "=== Dependency Check ==="
python3 -c "import sys; sys.path.insert(0, 'dfacesearch'); from deepfake_detection import TENSORFLOW_AVAILABLE, OPENCV_AVAILABLE, NUMPY_AVAILABLE, PIL_AVAILABLE; print('TensorFlow:', TENSORFLOW_AVAILABLE); print('OpenCV:', OPENCV_AVAILABLE); print('NumPy:', NUMPY_AVAILABLE); print('Pillow:', PIL_AVAILABLE)"

# Run full test (if test_image.png exists)
if [ -f "test_image.png" ]; then
    echo ""
    echo "=== Running Full Test ==="
    python3 test_deepfake_render.py test_image.png
else
    echo ""
    echo "=== Test Image Not Found ==="
    echo "Upload test_image.png first, or run:"
    echo "  python3 test_deepfake_render.py <path_to_image>"
fi
