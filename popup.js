// DOM Elements
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const screenshotBtn = document.getElementById('screenshotBtn');
const editBtn = document.getElementById('editBtn');
const saveBtn = document.getElementById('saveBtn');
const previewContainer = document.getElementById('previewContainer');
const previewImage = document.getElementById('previewImage');
const imageCanvas = document.getElementById('imageCanvas');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const editPanel = document.getElementById('editPanel');
const resetBtn = document.getElementById('resetBtn');

// Edit controls
const brightnessSlider = document.getElementById('brightness');
const contrastSlider = document.getElementById('contrast');
const saturationSlider = document.getElementById('saturation');
const blurSlider = document.getElementById('blur');
const brightnessValue = document.getElementById('brightnessValue');
const contrastValue = document.getElementById('contrastValue');
const saturationValue = document.getElementById('saturationValue');
const blurValue = document.getElementById('blurValue');

// State
let currentImage = null;
let originalImage = null;
let isEditing = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  setupEventListeners();
});

// Theme Management
function loadTheme() {
  const theme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcon(theme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  if (theme === 'dark') {
    themeIcon.className = 'fas fa-moon theme-icon';
  } else {
    themeIcon.className = 'fas fa-sun theme-icon';
  }
}

// Event Listeners
function setupEventListeners() {
  // File upload
  uploadBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleFileUpload);

  // Screenshot
  screenshotBtn.addEventListener('click', takeScreenshot);

  // Edit
  editBtn.addEventListener('click', toggleEditPanel);
  resetBtn.addEventListener('click', resetFilters);

  // Save
  saveBtn.addEventListener('click', saveImage);

  // Theme toggle
  themeToggle.addEventListener('click', toggleTheme);

  // Edit sliders
  brightnessSlider.addEventListener('input', applyFilters);
  contrastSlider.addEventListener('input', applyFilters);
  saturationSlider.addEventListener('input', applyFilters);
  blurSlider.addEventListener('input', applyFilters);
}

// File Upload Handler
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      loadImage(e.target.result);
    };
    reader.readAsDataURL(file);
  }
}

// Screenshot Handler
async function takeScreenshot() {
  try {
    screenshotBtn.disabled = true;
    screenshotBtn.querySelector('.btn-text').textContent = 'Capturing...';

    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Capture visible tab
    const dataUrl = await chrome.tabs.captureVisibleTab(null, {
      format: 'png',
      quality: 100
    });

    loadImage(dataUrl);
    screenshotBtn.querySelector('.btn-text').textContent = 'Take Screenshot';
  } catch (error) {
    console.error('Error taking screenshot:', error);
    alert('Failed to take screenshot. Please try again.');
    screenshotBtn.querySelector('.btn-text').textContent = 'Take Screenshot';
  } finally {
    screenshotBtn.disabled = false;
  }
}

// Load Image
function loadImage(imageSrc) {
  currentImage = new Image();
  currentImage.crossOrigin = 'anonymous';
  
  currentImage.onload = () => {
    // Hide placeholder
    const placeholder = previewContainer.querySelector('.preview-placeholder');
    if (placeholder) placeholder.style.display = 'none';

    // Setup canvas
    const ctx = imageCanvas.getContext('2d');
    const maxWidth = 360;
    const maxHeight = 400;
    
    let width = currentImage.width;
    let height = currentImage.height;
    
    // Scale if needed
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = width * ratio;
      height = height * ratio;
    }
    
    imageCanvas.width = width;
    imageCanvas.height = height;
    
    ctx.drawImage(currentImage, 0, 0, width, height);
    
    // Store original for reset - create a new image and wait for it to load
    originalImage = new Image();
    originalImage.crossOrigin = 'anonymous';
    originalImage.onload = () => {
      // Original image loaded, ready for filters
    };
    originalImage.src = imageSrc;
    
    // Show canvas
    previewImage.style.display = 'none';
    imageCanvas.style.display = 'block';
    imageCanvas.classList.add('active');
    
    // Enable buttons
    editBtn.disabled = false;
    saveBtn.disabled = false;
    
    // Reset filters
    resetFilters();
  };
  
  currentImage.onerror = () => {
    console.error('Failed to load image');
    alert('Failed to load image. Please try again.');
  };
  
  currentImage.src = imageSrc;
}

// Toggle Edit Panel
function toggleEditPanel() {
  isEditing = !isEditing;
  editPanel.style.display = isEditing ? 'block' : 'none';
  editBtn.querySelector('.btn-text').textContent = isEditing ? 'Close Edit' : 'Edit Image';
}

// Apply Filters
function applyFilters() {
  if (!currentImage || !imageCanvas.classList.contains('active')) return;

  const ctx = imageCanvas.getContext('2d');
  const brightness = brightnessSlider.value;
  const contrast = contrastSlider.value;
  const saturation = saturationSlider.value;
  const blur = blurSlider.value;

  // Update value displays
  brightnessValue.textContent = `${brightness}%`;
  contrastValue.textContent = `${contrast}%`;
  saturationValue.textContent = `${saturation}%`;
  blurValue.textContent = `${blur}px`;

  // Clear and redraw - use originalImage if available, otherwise use currentImage
  ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
  const imageToDraw = (originalImage && originalImage.complete) ? originalImage : currentImage;
  ctx.drawImage(imageToDraw, 0, 0, imageCanvas.width, imageCanvas.height);

  // Get image data
  const imageData = ctx.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
  const data = imageData.data;

  // Apply filters
  for (let i = 0; i < data.length; i += 4) {
    // Brightness
    data[i] = Math.min(255, (data[i] * brightness) / 100);
    data[i + 1] = Math.min(255, (data[i + 1] * brightness) / 100);
    data[i + 2] = Math.min(255, (data[i + 2] * brightness) / 100);

    // Contrast
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
    data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
    data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));

    // Saturation
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const satFactor = saturation / 100;
    data[i] = Math.min(255, gray + satFactor * (data[i] - gray));
    data[i + 1] = Math.min(255, gray + satFactor * (data[i + 1] - gray));
    data[i + 2] = Math.min(255, gray + satFactor * (data[i + 2] - gray));
  }

  ctx.putImageData(imageData, 0, 0);

  // Apply blur using CSS filter (for better performance)
  if (blur > 0) {
    imageCanvas.style.filter = `blur(${blur}px)`;
  } else {
    imageCanvas.style.filter = 'none';
  }
}

// Reset Filters
function resetFilters() {
  brightnessSlider.value = 100;
  contrastSlider.value = 100;
  saturationSlider.value = 100;
  blurSlider.value = 0;
  
  brightnessValue.textContent = '100%';
  contrastValue.textContent = '100%';
  saturationValue.textContent = '100%';
  blurValue.textContent = '0px';
  
  if (currentImage && imageCanvas.classList.contains('active')) {
    const ctx = imageCanvas.getContext('2d');
    ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
    // Use originalImage if available, otherwise use currentImage
    const imageToDraw = (originalImage && originalImage.complete) ? originalImage : currentImage;
    ctx.drawImage(imageToDraw, 0, 0, imageCanvas.width, imageCanvas.height);
    imageCanvas.style.filter = 'none';
  }
}

// Save Image
function saveImage() {
  if (!imageCanvas.classList.contains('active')) return;

  imageCanvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `editly-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 'image/png');
}

