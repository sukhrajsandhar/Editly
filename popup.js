// ============================================
// Page Navigation
// ============================================

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add('active');
  }
}

// Feature card navigation
document.querySelectorAll('.feature-card').forEach(card => {
  card.addEventListener('click', () => {
    const pageId = card.dataset.page + 'Page';
    showPage(pageId);
  });
});

// Back button navigation
document.querySelectorAll('.back-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetPage = btn.dataset.back + 'Page';
    showPage(targetPage);
  });
});

// ============================================
// Theme Management
// ============================================

const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

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

themeToggle.addEventListener('click', toggleTheme);
loadTheme();

// ============================================
// Background Remover Page
// ============================================

const bgFileInput = document.getElementById('bgFileInput');
const bgUploadBtn = document.getElementById('bgUploadBtn');
const bgUploadArea = document.getElementById('bgUploadArea');
const bgPreview = document.getElementById('bgPreview');
const bgPreviewImage = document.getElementById('bgPreviewImage');
const bgProgress = document.getElementById('bgProgress');
const bgProgressFill = document.getElementById('bgProgressFill');
const bgResult = document.getElementById('bgResult');
const bgResultImage = document.getElementById('bgResultImage');
const bgRemoveBtn = document.getElementById('bgRemoveBtn');
const bgDownloadBtn = document.getElementById('bgDownloadBtn');
const bgDownloadResultBtn = document.getElementById('bgDownloadResultBtn');
const bgTryAgainBtn = document.getElementById('bgTryAgainBtn');

let bgCurrentImage = null;

// Upload button
bgUploadBtn.addEventListener('click', () => bgFileInput.click());
bgFileInput.addEventListener('change', handleBgUpload);

// Drag and drop
bgUploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  bgUploadArea.classList.add('dragover');
});

bgUploadArea.addEventListener('dragleave', () => {
  bgUploadArea.classList.remove('dragover');
});

bgUploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  bgUploadArea.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    handleBgFile(file);
  }
});

function handleBgUpload(e) {
  const file = e.target.files[0];
  if (file) {
    handleBgFile(file);
  }
}

function handleBgFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    bgCurrentImage = e.target.result;
    bgPreviewImage.src = bgCurrentImage;
    bgUploadArea.querySelector('.upload-placeholder').style.display = 'none';
    bgPreview.style.display = 'block';
  };
  reader.readAsDataURL(file);
}

// Remove background (placeholder - would use AI service in production)
bgRemoveBtn.addEventListener('click', () => {
  if (!bgCurrentImage) return;
  
  bgPreview.style.display = 'none';
  bgProgress.style.display = 'block';
  
  // Simulate processing
  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    bgProgressFill.style.width = progress + '%';
    
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        bgProgress.style.display = 'none';
        bgResult.style.display = 'block';
        // In production, this would be the processed image
        bgResultImage.src = bgCurrentImage;
      }, 500);
    }
  }, 200);
});

// Download buttons
bgDownloadBtn.addEventListener('click', () => {
  if (bgCurrentImage) downloadImage(bgCurrentImage, 'background-removed.png');
});

bgDownloadResultBtn.addEventListener('click', () => {
  if (bgResultImage.src) downloadImage(bgResultImage.src, 'background-removed.png');
});

// Try again
bgTryAgainBtn.addEventListener('click', () => {
  bgResult.style.display = 'none';
  bgPreview.style.display = 'none';
  bgUploadArea.querySelector('.upload-placeholder').style.display = 'flex';
  bgCurrentImage = null;
  bgFileInput.value = '';
});

// ============================================
// Edit Photo Page
// ============================================

const editFileInput = document.getElementById('editFileInput');
const editUploadBtn = document.getElementById('editUploadBtn');
const editPreviewContainer = document.getElementById('editPreviewContainer');
const editImageCanvas = document.getElementById('editImageCanvas');
const editPreviewImage = document.getElementById('editPreviewImage');
const editControlsPanel = document.getElementById('editControlsPanel');
const editBrightness = document.getElementById('editBrightness');
const editContrast = document.getElementById('editContrast');
const editSaturation = document.getElementById('editSaturation');
const editBlur = document.getElementById('editBlur');
const editBrightnessValue = document.getElementById('editBrightnessValue');
const editContrastValue = document.getElementById('editContrastValue');
const editSaturationValue = document.getElementById('editSaturationValue');
const editBlurValue = document.getElementById('editBlurValue');
const editResetBtn = document.getElementById('editResetBtn');
const editSaveBtn = document.getElementById('editSaveBtn');

let editCurrentImage = null;
let editOriginalImage = null;

editUploadBtn.addEventListener('click', () => editFileInput.click());
editFileInput.addEventListener('change', handleEditUpload);

function handleEditUpload(e) {
  const file = e.target.files[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      loadEditImage(e.target.result);
    };
    reader.readAsDataURL(file);
  }
}

function loadEditImage(imageSrc) {
  editCurrentImage = new Image();
  editCurrentImage.crossOrigin = 'anonymous';
  
  editCurrentImage.onload = () => {
    const placeholder = editPreviewContainer.querySelector('.preview-placeholder');
    if (placeholder) placeholder.style.display = 'none';

    const ctx = editImageCanvas.getContext('2d');
    const maxWidth = 360;
    const maxHeight = 400;
    
    let width = editCurrentImage.width;
    let height = editCurrentImage.height;
    
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = width * ratio;
      height = height * ratio;
    }
    
    editImageCanvas.width = width;
    editImageCanvas.height = height;
    
    ctx.drawImage(editCurrentImage, 0, 0, width, height);
    
    editOriginalImage = new Image();
    editOriginalImage.crossOrigin = 'anonymous';
    editOriginalImage.onload = () => {};
    editOriginalImage.src = imageSrc;
    
    editPreviewImage.style.display = 'none';
    editImageCanvas.style.display = 'block';
    editImageCanvas.classList.add('active');
    
    editControlsPanel.style.display = 'block';
    resetEditFilters();
  };
  
  editCurrentImage.onerror = () => {
    alert('Failed to load image. Please try again.');
  };
  
  editCurrentImage.src = imageSrc;
}

// Edit filters
editBrightness.addEventListener('input', applyEditFilters);
editContrast.addEventListener('input', applyEditFilters);
editSaturation.addEventListener('input', applyEditFilters);
editBlur.addEventListener('input', applyEditFilters);

function applyEditFilters() {
  if (!editCurrentImage || !editImageCanvas.classList.contains('active')) return;

  const ctx = editImageCanvas.getContext('2d');
  const brightness = editBrightness.value;
  const contrast = editContrast.value;
  const saturation = editSaturation.value;
  const blur = editBlur.value;

  editBrightnessValue.textContent = `${brightness}%`;
  editContrastValue.textContent = `${contrast}%`;
  editSaturationValue.textContent = `${saturation}%`;
  editBlurValue.textContent = `${blur}px`;

  ctx.clearRect(0, 0, editImageCanvas.width, editImageCanvas.height);
  const imageToDraw = (editOriginalImage && editOriginalImage.complete) ? editOriginalImage : editCurrentImage;
  ctx.drawImage(imageToDraw, 0, 0, editImageCanvas.width, editImageCanvas.height);

  const imageData = ctx.getImageData(0, 0, editImageCanvas.width, editImageCanvas.height);
  const data = imageData.data;

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

  if (blur > 0) {
    editImageCanvas.style.filter = `blur(${blur}px)`;
  } else {
    editImageCanvas.style.filter = 'none';
  }
}

function resetEditFilters() {
  editBrightness.value = 100;
  editContrast.value = 100;
  editSaturation.value = 100;
  editBlur.value = 0;
  
  editBrightnessValue.textContent = '100%';
  editContrastValue.textContent = '100%';
  editSaturationValue.textContent = '100%';
  editBlurValue.textContent = '0px';
  
  if (editCurrentImage && editImageCanvas.classList.contains('active')) {
    const ctx = editImageCanvas.getContext('2d');
    ctx.clearRect(0, 0, editImageCanvas.width, editImageCanvas.height);
    const imageToDraw = (editOriginalImage && editOriginalImage.complete) ? editOriginalImage : editCurrentImage;
    ctx.drawImage(imageToDraw, 0, 0, editImageCanvas.width, editImageCanvas.height);
    editImageCanvas.style.filter = 'none';
  }
}

editResetBtn.addEventListener('click', resetEditFilters);
editSaveBtn.addEventListener('click', () => {
  if (!editImageCanvas.classList.contains('active')) return;
  editImageCanvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `editly-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 'image/png');
});

// ============================================
// Screenshot Page
// ============================================

const screenshotStartBtn = document.getElementById('screenshotStartBtn');

screenshotStartBtn.addEventListener('click', async () => {
  try {
    screenshotStartBtn.disabled = true;
    screenshotStartBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Starting...';

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      throw new Error('No active tab found');
    }

    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
    } catch (e) {
      console.log('Script injection note:', e.message);
    }

    chrome.tabs.sendMessage(tab.id, { action: 'startScreenshot' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error starting screenshot:', chrome.runtime.lastError);
        alert('Failed to start screenshot. Please refresh the page and try again.');
        screenshotStartBtn.innerHTML = '<i class="fas fa-camera"></i> Start Screenshot';
        screenshotStartBtn.disabled = false;
        return;
      }
      window.close();
    });

  } catch (error) {
    console.error('Error taking screenshot:', error);
    alert('Failed to take screenshot. Please try again.');
    screenshotStartBtn.innerHTML = '<i class="fas fa-camera"></i> Start Screenshot';
    screenshotStartBtn.disabled = false;
  }
});

// Listen for screenshot results
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'screenshotCaptured') {
    // Navigate to edit page and load image
    showPage('editPhotoPage');
    setTimeout(() => {
      loadEditImage(request.imageData);
    }, 300);
  } else if (request.action === 'screenshotError') {
    alert('Screenshot error: ' + request.error);
    screenshotStartBtn.innerHTML = '<i class="fas fa-camera"></i> Start Screenshot';
    screenshotStartBtn.disabled = false;
  }
});

// Check for pending screenshot
chrome.storage.local.get(['pendingScreenshot'], (result) => {
  if (result.pendingScreenshot) {
    showPage('editPhotoPage');
    setTimeout(() => {
      loadEditImage(result.pendingScreenshot);
    }, 300);
    chrome.storage.local.remove(['pendingScreenshot']);
  }
});

// ============================================
// File Conversions Page
// ============================================

const fromFormat = document.getElementById('fromFormat');
const toFormat = document.getElementById('toFormat');
const conversionFileInput = document.getElementById('conversionFileInput');
const conversionUploadBtn = document.getElementById('conversionUploadBtn');
const conversionUploadArea = document.getElementById('conversionUploadArea');
const conversionPreview = document.getElementById('conversionPreview');
const conversionFileName = document.getElementById('conversionFileName');
const conversionFileSize = document.getElementById('conversionFileSize');
const conversionFileIcon = document.getElementById('conversionFileIcon');
const conversionProgress = document.getElementById('conversionProgress');
const conversionProgressFill = document.getElementById('conversionProgressFill');
const conversionResult = document.getElementById('conversionResult');
const conversionDownloadBtn = document.getElementById('conversionDownloadBtn');
const conversionTryAgainBtn = document.getElementById('conversionTryAgainBtn');

let conversionCurrentFile = null;
let conversionResultBlob = null;

// Format mapping for file icons and MIME types
const formatIcons = {
  pdf: 'fa-file-pdf',
  jpg: 'fa-file-image',
  jpeg: 'fa-file-image',
  png: 'fa-file-image',
  gif: 'fa-file-image',
  webp: 'fa-file-image',
  svg: 'fa-file-image',
  bmp: 'fa-file-image',
  ico: 'fa-file-image',
  tiff: 'fa-file-image',
  heic: 'fa-file-image',
  docx: 'fa-file-word',
  doc: 'fa-file-word',
  txt: 'fa-file-alt',
  rtf: 'fa-file-alt'
};

// Update file input accept based on from format
fromFormat.addEventListener('change', () => {
  const format = fromFormat.value;
  if (format) {
    const acceptTypes = getAcceptTypes(format);
    conversionFileInput.accept = acceptTypes;
  } else {
    conversionFileInput.accept = '';
  }
  // Reset file selection when format changes
  conversionFileInput.value = '';
  conversionPreview.style.display = 'none';
  conversionUploadArea.querySelector('.upload-placeholder').style.display = 'flex';
  conversionCurrentFile = null;
});

conversionUploadBtn.addEventListener('click', () => conversionFileInput.click());
conversionFileInput.addEventListener('change', handleConversionUpload);

// Drag and drop
conversionUploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  conversionUploadArea.classList.add('dragover');
});

conversionUploadArea.addEventListener('dragleave', () => {
  conversionUploadArea.classList.remove('dragover');
});

conversionUploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  conversionUploadArea.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) {
    handleConversionFile(file);
  }
});

function handleConversionUpload(e) {
  const file = e.target.files[0];
  if (file) {
    handleConversionFile(file);
  }
}

function handleConversionFile(file) {
  conversionCurrentFile = file;
  const fileExtension = file.name.split('.').pop().toLowerCase();
  
  // Update file icon
  const iconClass = formatIcons[fileExtension] || 'fa-file';
  conversionFileIcon.className = `fas ${iconClass}`;
  
  // Update file info
  conversionFileName.textContent = file.name;
  conversionFileSize.textContent = formatFileSize(file.size);
  
  // Show preview
  conversionUploadArea.querySelector('.upload-placeholder').style.display = 'none';
  conversionPreview.style.display = 'block';
  
  // Auto-convert if both formats are selected
  if (fromFormat.value && toFormat.value) {
    startConversion();
  }
}

// Auto-start conversion when both formats are selected and file is uploaded
toFormat.addEventListener('change', () => {
  if (conversionCurrentFile && fromFormat.value && toFormat.value) {
    startConversion();
  }
});

function startConversion() {
  if (!conversionCurrentFile || !fromFormat.value || !toFormat.value) {
    alert('Please select both source and target formats, and upload a file.');
    return;
  }
  
  if (fromFormat.value === toFormat.value) {
    alert('Source and target formats cannot be the same.');
    return;
  }
  
  conversionPreview.style.display = 'none';
  conversionProgress.style.display = 'block';
  conversionResult.style.display = 'none';
  
  // Simulate conversion process
  let progress = 0;
  const interval = setInterval(() => {
    progress += 5;
    conversionProgressFill.style.width = progress + '%';
    
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        // In a real implementation, this would call a conversion API
        // For now, we'll simulate by creating a download-ready file
        simulateConversion();
      }, 500);
    }
  }, 100);
}

function simulateConversion() {
  conversionProgress.style.display = 'none';
  conversionResult.style.display = 'block';
  
  // Create a blob from the file (in production, this would be the converted file)
  const reader = new FileReader();
  reader.onload = (e) => {
    // In production, this would be the actual converted file
    conversionResultBlob = new Blob([e.target.result], { type: getMimeType(toFormat.value) });
  };
  reader.readAsArrayBuffer(conversionCurrentFile);
}

conversionDownloadBtn.addEventListener('click', () => {
  if (conversionResultBlob) {
    const url = URL.createObjectURL(conversionResultBlob);
    const a = document.createElement('a');
    a.href = url;
    const newFileName = conversionCurrentFile.name.replace(/\.[^/.]+$/, '') + '.' + toFormat.value;
    a.download = newFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } else {
    // Fallback: download original file with new extension
    const url = URL.createObjectURL(conversionCurrentFile);
    const a = document.createElement('a');
    a.href = url;
    const newFileName = conversionCurrentFile.name.replace(/\.[^/.]+$/, '') + '.' + toFormat.value;
    a.download = newFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
});

conversionTryAgainBtn.addEventListener('click', () => {
  conversionResult.style.display = 'none';
  conversionPreview.style.display = 'none';
  conversionUploadArea.querySelector('.upload-placeholder').style.display = 'flex';
  conversionCurrentFile = null;
  conversionResultBlob = null;
  conversionFileInput.value = '';
  fromFormat.value = '';
  toFormat.value = '';
});

function getAcceptTypes(format) {
  const typeMap = {
    pdf: '.pdf',
    jpg: '.jpg,.jpeg',
    png: '.png',
    gif: '.gif',
    webp: '.webp',
    svg: '.svg',
    bmp: '.bmp',
    ico: '.ico',
    tiff: '.tiff,.tif',
    heic: '.heic,.heif',
    docx: '.docx',
    doc: '.doc',
    txt: '.txt',
    rtf: '.rtf'
  };
  return typeMap[format] || '';
}

function getMimeType(format) {
  const mimeMap = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    bmp: 'image/bmp',
    ico: 'image/x-icon',
    tiff: 'image/tiff',
    heic: 'image/heic',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    doc: 'application/msword',
    txt: 'text/plain',
    rtf: 'application/rtf'
  };
  return mimeMap[format] || 'application/octet-stream';
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ============================================
// Utility Functions
// ============================================

function downloadImage(imageSrc, filename) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/png');
  };
  img.src = imageSrc;
}
