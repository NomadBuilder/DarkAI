// DFaceCheck - Main JavaScript (ShadowStack integration)

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
    uploadArea.style.borderColor = '#d9353e';
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
    e.stopPropagation();
    clearImage();
});

function clearImage() {
    selectedFile = null;
    imageInput.value = '';
    previewContainer.style.display = 'none';
    previewImage.src = '';
    searchBtn.disabled = true;
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
    
    try {
        // Step 1: Detecting face
        updateStatusStep(1, 'Detecting face in image...');
        
        const response = await fetch('/shadowstack/dfacecheck/api/search', {
            method: 'POST',
            body: formData
        });
        
        // Step 2: Uploading (happens in backend)
        updateStatusStep(2, 'Uploading to temporary host...');
        
        // Simulate progress
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
        // Mark previous steps as completed
        for (let i = 1; i < stepNum; i++) {
            const prevStep = document.getElementById(`step-${i}`);
            if (prevStep) {
                prevStep.classList.remove('active');
                prevStep.classList.add('completed');
                prevStep.querySelector('.step-icon').textContent = '✅';
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
    
    const verifiedCount = data.verified_count || 0;
    const unverifiedCount = data.unverified_count || 0;
    
    let html = `
        <div style="margin-bottom: 1rem; padding: 1rem; background: rgba(15, 23, 42, 0.7); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.08);">
            <strong>Total Results:</strong> ${data.total_results} 
            ${verifiedCount > 0 ? `| <strong style="color: #10b981;">Verified:</strong> ${verifiedCount}` : ''}
            ${unverifiedCount > 0 ? `| <strong style="color: #f59e0b;">Unverified:</strong> ${unverifiedCount}` : ''}
            ${data.flagged_count > 0 ? `| <strong style="color: #d9353e;">Flagged:</strong> ${data.flagged_count}` : ''}
        </div>
    `;
    
    if (unverifiedCount > 0) {
        html += `
            <div style="margin-bottom: 1rem; padding: 1rem; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; color: #fbbf24;">
                <strong>ℹ️ Note:</strong> Some results are unverified (face recognition couldn't confirm). These may still be legitimate matches from reverse image search engines.
            </div>
        `;
    }
    
    data.results.forEach((result, index) => {
        const flaggedClass = result.flagged ? 'flagged' : '';
        const flagBadge = result.flagged 
            ? '<span class="flag-badge">⚠️ Known NCII Site</span>' 
            : '';
        
        // Show verification status
        let verificationBadge = '';
        if (result.verified === false) {
            verificationBadge = '<span class="similarity-badge" style="background: #f59e0b; margin-left: 0.5rem;">⚠️ Unverified</span>';
        } else if (result.face_similarity !== undefined) {
            const similarity = (result.face_similarity * 100).toFixed(1);
            const confidence = result.match_confidence || 'Medium';
            const confidenceColor = confidence === 'High' ? '#10b981' : confidence === 'Medium' ? '#f59e0b' : '#ef4444';
            verificationBadge = `<span class="similarity-badge" style="background: ${confidenceColor}; margin-left: 0.5rem;">👤 ${similarity}% match (${confidence})</span>`;
        }
        
        html += `
            <div class="result-item ${flaggedClass}">
                <div>
                    <a href="${result.url}" target="_blank" class="url">${result.url}</a>
                    ${flagBadge}
                    ${verificationBadge}
                </div>
                ${result.title ? `<p style="margin-top: 0.5rem; color: #9ca3af;">${result.title}</p>` : ''}
                ${result.source_name ? `<p style="margin-top: 0.25rem; font-size: 0.85rem; color: #9ca3af;">Source: ${result.source_name}</p>` : ''}
            </div>
        `;
    });
    
    resultsContainer.innerHTML = html;
}

function showError(message) {
    resultsSection.style.display = 'block';
    resultsContainer.innerHTML = `<div class="error">${message}</div>`;
}

