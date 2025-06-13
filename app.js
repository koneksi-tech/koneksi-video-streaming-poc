// Koneksi API Configuration
const CONFIG = {
    baseURL: 'https://staging.koneksi.co.kr',
    clientID: 'id_B47SKl7rm4UkEjCfXkWMHw5WIKbf86KpGiv9UwKp8',
    clientSecret: 'sk_IGwN3jpB9hShu9ifBnNvfFNezNwWJQkBUtCGxZG7z84',
    directoryID: '684c1048ee0d9cbdeedbd0bf'
};

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const selectedFile = document.getElementById('selectedFile');
const fileName = document.getElementById('fileName');
const uploadButton = document.getElementById('uploadButton');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');
const videoGrid = document.getElementById('videoGrid');
const videoModal = document.getElementById('videoModal');
const modalVideo = document.getElementById('modalVideo');

let selectedVideoFile = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadVideos();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    // Click to upload
    uploadArea.addEventListener('click', () => fileInput.click());
    
    // File selection
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Upload button
    uploadButton.addEventListener('click', uploadVideo);
    
    // Close modal on click outside
    videoModal.addEventListener('click', (e) => {
        if (e.target === videoModal) {
            closeModal();
        }
    });
}

// File Selection Handlers
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
        selectFile(file);
    } else {
        showError('Please select a valid video file');
    }
}

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
        selectFile(file);
    } else {
        showError('Please drop a valid video file');
    }
}

function selectFile(file) {
    selectedVideoFile = file;
    fileName.textContent = `${file.name} (${formatFileSize(file.size)})`;
    selectedFile.style.display = 'block';
    uploadButton.style.display = 'inline-block';
    hideMessages();
}

// Upload Video
async function uploadVideo() {
    if (!selectedVideoFile) return;
    
    uploadButton.disabled = true;
    progressBar.style.display = 'block';
    hideMessages();
    
    const formData = new FormData();
    formData.append('file', selectedVideoFile);
    
    try {
        const response = await fetch(`${CONFIG.baseURL}/api/clients/v1/files?directory_id=${CONFIG.directoryID}`, {
            method: 'POST',
            headers: {
                'Client-ID': CONFIG.clientID,
                'Client-Secret': CONFIG.clientSecret
            },
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }
        
        const result = await response.json();
        showSuccess('Video uploaded successfully!');
        resetUploadForm();
        loadVideos();
        
    } catch (error) {
        showError(`Upload failed: ${error.message}`);
    } finally {
        uploadButton.disabled = false;
        progressBar.style.display = 'none';
        progressFill.style.width = '0%';
    }
}

// Load Videos
async function loadVideos() {
    try {
        const response = await fetch(`${CONFIG.baseURL}/api/clients/v1/directories/${CONFIG.directoryID}`, {
            headers: {
                'Client-ID': CONFIG.clientID,
                'Client-Secret': CONFIG.clientSecret
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to load videos: ${response.statusText}`);
        }
        
        const result = await response.json();
        displayVideos(result.data.files || []);
        
    } catch (error) {
        videoGrid.innerHTML = `<div class="error-message">Failed to load videos: ${error.message}</div>`;
    }
}

// Display Videos
function displayVideos(files) {
    // Filter for video files
    const videoFiles = files.filter(file => {
        const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
        return videoExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    });
    
    if (videoFiles.length === 0) {
        videoGrid.innerHTML = '<div class="loading">No videos found. Upload your first video!</div>';
        return;
    }
    
    videoGrid.innerHTML = videoFiles.map(file => `
        <div class="video-card">
            <div class="video-player" onclick="playVideo('${file.id}', '${file.name}')" style="cursor: pointer; position: relative;">
                <video style="width: 100%; height: 100%; object-fit: cover;">
                    <source src="${CONFIG.baseURL}/api/clients/v1/files/${file.id}/download" 
                            type="${file.contentType || 'video/mp4'}">
                </video>
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                            background: rgba(0,0,0,0.7); border-radius: 50%; width: 60px; height: 60px; 
                            display: flex; align-items: center; justify-content: center;">
                    <div style="width: 0; height: 0; border-left: 20px solid white; 
                                border-top: 15px solid transparent; border-bottom: 15px solid transparent; 
                                margin-left: 5px;"></div>
                </div>
            </div>
            <div class="video-info">
                <div class="video-title">${file.name}</div>
                <div class="video-meta">
                    ${formatFileSize(file.size)} • ${formatDate(file.createdAt)}
                </div>
                <button class="delete-button" onclick="deleteVideo('${file.id}', '${file.name}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Play Video in Modal
function playVideo(fileId, fileName) {
    modalVideo.src = `${CONFIG.baseURL}/api/clients/v1/files/${fileId}/download`;
    modalVideo.setAttribute('data-file-id', fileId);
    modalVideo.setAttribute('data-file-name', fileName);
    
    // Add headers for authenticated request
    modalVideo.addEventListener('loadstart', function() {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', modalVideo.src, true);
        xhr.setRequestHeader('Client-ID', CONFIG.clientID);
        xhr.setRequestHeader('Client-Secret', CONFIG.clientSecret);
        xhr.responseType = 'blob';
        
        xhr.onload = function() {
            if (xhr.status === 200) {
                const blob = xhr.response;
                const objectURL = URL.createObjectURL(blob);
                modalVideo.src = objectURL;
            }
        };
        
        xhr.send();
    }, { once: true });
    
    videoModal.style.display = 'block';
    modalVideo.play();
}

// Close Modal
function closeModal() {
    videoModal.style.display = 'none';
    modalVideo.pause();
    modalVideo.src = '';
}

// Delete Video
async function deleteVideo(fileId, fileName) {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${CONFIG.baseURL}/api/clients/v1/files/${fileId}`, {
            method: 'DELETE',
            headers: {
                'Client-ID': CONFIG.clientID,
                'Client-Secret': CONFIG.clientSecret
            }
        });
        
        if (!response.ok) {
            throw new Error(`Delete failed: ${response.statusText}`);
        }
        
        showSuccess('Video deleted successfully!');
        loadVideos();
        
    } catch (error) {
        showError(`Delete failed: ${error.message}`);
    }
}

// Helper Functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    successMessage.style.display = 'none';
}

function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    errorMessage.style.display = 'none';
}

function hideMessages() {
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
}

function resetUploadForm() {
    selectedVideoFile = null;
    fileInput.value = '';
    selectedFile.style.display = 'none';
    uploadButton.style.display = 'none';
}
