// DFaceSearch - Main JavaScript

const uploadArea = document.getElementById('upload-area');
const imageInput = document.getElementById('image-input');
const previewImage = document.getElementById('preview-image');
const previewContainer = document.getElementById('preview-container');
const removeBtn = document.getElementById('remove-btn');
const searchBtn = document.getElementById('search-btn');
const resultsSection = document.getElementById('results-section');
const resultsContainer = document.getElementById('results-container');
const loading = document.getElementById('loading');

let selectedFile = null;

// Upload area click
uploadArea.addEventListener('click', () => {
    imageInput.click();
});

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#ff6b6b';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = 'rgba(255, 255, 255, 0.3)';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'rgba(255, 255, 255, 0.3)';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelect(files[0]);
    }
});

// File input change
imageInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
    }
});

function handleFileSelect(file) {
    // Validate file
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
    }
    
    selectedFile = file;
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        previewContainer.style.display = 'block';
    };
    reader.readAsDataURL(file);
    
    searchBtn.disabled = false;
}

// Remove button click
removeBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent triggering upload area click
    clearImage();
});

function clearImage() {
    // Clear file selection
    selectedFile = null;
    imageInput.value = '';
    
    // Hide preview
    previewContainer.style.display = 'none';
    previewImage.src = '';
    
    // Disable search button
    searchBtn.disabled = true;
    
    // Clear results
    resultsSection.style.display = 'none';
    resultsContainer.innerHTML = '';
}

// Search button click
searchBtn.addEventListener('click', async () => {
    if (!selectedFile) return;
    
    const formData = new FormData();
    formData.append('image', selectedFile);
    
    // Show loading with status updates
    loading.style.display = 'block';
    resultsSection.style.display = 'none';
    searchBtn.disabled = true;
    
    // Reset all status steps
    for (let i = 1; i <= 6; i++) {
        const step = document.getElementById(`step-${i}`);
        if (step) {
            step.classList.remove('active', 'completed');
            step.querySelector('.step-icon').textContent = '⏳';
        }
    }
    // Reset step 1b (deepfake detection)
    const step1b = document.getElementById('step-1b');
    if (step1b) {
        step1b.classList.remove('active', 'completed');
        step1b.querySelector('.step-icon').textContent = '⏳';
    }
    
    // Hide deepfake alert
    const deepfakeAlert = document.getElementById('deepfake-alert');
    if (deepfakeAlert) {
        deepfakeAlert.style.display = 'none';
    }
    
    // Update status text
    const statusText = document.querySelector('.status-text');
    
    try {
        // Step 1: Detecting face
        updateStatusStep(1, 'Detecting face in image...');
        
        const response = await fetch('/dfacesearch/api/search', {
            method: 'POST',
            body: formData
        });
        
        // Step 1b: Deepfake detection (happens in backend)
        setTimeout(() => {
            const step1b = document.getElementById('step-1b');
            if (step1b) {
                const statusText = document.querySelector('.status-text');
                if (statusText) {
                    statusText.textContent = 'Analyzing for deepfake indicators...';
                }
                step1b.classList.add('active');
            }
        }, 1000);
        
        // Step 2: Uploading (happens in backend)
        updateStatusStep(2, 'Uploading to temporary host...');
        
        // Simulate progress (since we can't get real-time updates from backend)
        setTimeout(() => updateStatusStep(3, 'Searching reverse image engines...'), 2000);
        setTimeout(() => updateStatusStep(4, 'Verifying faces with AI...'), 4000);
        setTimeout(() => updateStatusStep(5, 'Cross-referencing databases...'), 6000);
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Search failed');
        }
        
        // Step 6: Deleting (happens in backend)
        updateStatusStep(6, 'Cleaning up temporary files...');
        
        // Small delay to show final step
        setTimeout(() => {
            loading.style.display = 'none';
            displayResults(data);
            
            // Show deepfake detection result if available
            if (data.deepfake_detection && data.deepfake_detection.is_deepfake) {
                const deepfakeAlert = document.getElementById('deepfake-alert');
                const deepfakeMessage = document.getElementById('deepfake-message');
                if (deepfakeAlert && deepfakeMessage) {
                    const confidence = (data.deepfake_detection.confidence * 100).toFixed(1);
                    deepfakeMessage.textContent = `This image shows signs of being a deepfake (${confidence}% confidence). The image may have been AI-generated or manipulated.`;
                    deepfakeAlert.style.display = 'block';
                }
            }
        }, 500);
        
    } catch (error) {
        loading.style.display = 'none';
        showError(error.message);
    } finally {
        searchBtn.disabled = false;
    }
});

function updateStatusStep(stepNum, text) {
    const step = document.getElementById(`step-${stepNum}`);
    const statusText = document.querySelector('.status-text');
    
    if (statusText) {
        statusText.textContent = text;
    }
    
    if (step) {
        // Mark previous steps as completed (including step-1b if we're past step 1)
        for (let i = 1; i < stepNum; i++) {
            const prevStep = document.getElementById(`step-${i}`);
            if (prevStep) {
                prevStep.classList.remove('active');
                prevStep.classList.add('completed');
                prevStep.querySelector('.step-icon').textContent = '✅';
            }
        }
        // Also mark step-1b as completed if we're past step 1
        if (stepNum > 1) {
            const step1b = document.getElementById('step-1b');
            if (step1b) {
                step1b.classList.remove('active');
                step1b.classList.add('completed');
                step1b.querySelector('.step-icon').textContent = '✅';
            }
        }
        
        // Mark current step as active
        step.classList.add('active');
        step.classList.remove('completed');
    }
}

function displayResults(data) {
    resultsSection.style.display = 'block';
    
    if (data.results.length === 0) {
        resultsContainer.innerHTML = '<p>No similar faces found.</p>';
        return;
    }
    
    let html = `
        <div style="margin-bottom: 1rem; padding: 1rem; background: rgba(5, 7, 11, 0.8); border-radius: 8px;">
            <strong>Total Results:</strong> ${data.total_results} | 
            <strong style="color: #ff6b6b;">Flagged:</strong> ${data.flagged_count}
        </div>
    `;
    
    data.results.forEach((result, index) => {
        const flaggedClass = result.flagged ? 'flagged' : '';
        const flagBadge = result.flagged 
            ? '<span class="flag-badge">⚠️ Known NCII Site</span>' 
            : '';
        
        // Show face similarity if available (face recognition match)
        let similarityBadge = '';
        if (result.face_similarity !== undefined) {
            const similarity = (result.face_similarity * 100).toFixed(1);
            const confidence = result.match_confidence || 'Medium';
            const confidenceColor = confidence === 'High' ? '#10b981' : confidence === 'Medium' ? '#f59e0b' : '#ef4444';
            similarityBadge = `<span class="similarity-badge" style="background: ${confidenceColor}; margin-left: 0.5rem;">👤 ${similarity}% match (${confidence})</span>`;
        }
        
        html += `
            <div class="result-item ${flaggedClass}">
                <div>
                    <a href="${result.url}" target="_blank" class="url">${result.url}</a>
                    ${flagBadge}
                    ${similarityBadge}
                </div>
                ${result.title ? `<p style="margin-top: 0.5rem; color: #94a3b8;">${result.title}</p>` : ''}
            </div>
        `;
    });
    
    resultsContainer.innerHTML = html;
}

function showError(message) {
    resultsSection.style.display = 'block';
    resultsContainer.innerHTML = `<div class="error">${message}</div>`;
}

