// Content script for drag-to-select screenshot
let isSelecting = false;
let startX = 0;
let startY = 0;
let selectionBox = null;
let overlay = null;

function createOverlay() {
  // Remove existing overlay if any
  if (overlay) {
    overlay.remove();
  }

  overlay = document.createElement('div');
  overlay.id = 'editly-screenshot-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    z-index: 999999;
    cursor: crosshair;
    user-select: none;
  `;

  selectionBox = document.createElement('div');
  selectionBox.id = 'editly-selection-box';
  selectionBox.style.cssText = `
    position: absolute;
    border: 2px solid #4a90e2;
    background: rgba(74, 144, 226, 0.1);
    pointer-events: none;
    display: none;
  `;

  overlay.appendChild(selectionBox);
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  // Mouse down - start selection
  overlay.addEventListener('mousedown', handleMouseDown);
  // Mouse move - update selection
  overlay.addEventListener('mousemove', handleMouseMove);
  // Mouse up - finish selection
  overlay.addEventListener('mouseup', handleMouseUp);
  // Escape key - cancel
  document.addEventListener('keydown', handleKeyDown);
}

function handleMouseDown(e) {
  isSelecting = true;
  startX = e.clientX;
  startY = e.clientY;
  
  selectionBox.style.left = startX + 'px';
  selectionBox.style.top = startY + 'px';
  selectionBox.style.width = '0px';
  selectionBox.style.height = '0px';
  selectionBox.style.display = 'block';
  
  e.preventDefault();
  e.stopPropagation();
}

function handleMouseMove(e) {
  if (!isSelecting) return;
  
  const currentX = e.clientX;
  const currentY = e.clientY;
  
  const left = Math.min(startX, currentX);
  const top = Math.min(startY, currentY);
  const width = Math.abs(currentX - startX);
  const height = Math.abs(currentY - startY);
  
  selectionBox.style.left = left + 'px';
  selectionBox.style.top = top + 'px';
  selectionBox.style.width = width + 'px';
  selectionBox.style.height = height + 'px';
  
  e.preventDefault();
  e.stopPropagation();
}

function handleMouseUp(e) {
  if (!isSelecting) return;
  
  isSelecting = false;
  
  const rect = selectionBox.getBoundingClientRect();
  
  // Only capture if selection is meaningful (at least 10x10 pixels)
  if (rect.width > 10 && rect.height > 10) {
    const selection = {
      x: Math.round(rect.left),
      y: Math.round(rect.top),
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    };
    
    // Request full screenshot and crop it
    chrome.runtime.sendMessage({
      action: 'captureSelection',
      selection: selection
    });
  } else {
    cleanup();
  }
  
  e.preventDefault();
  e.stopPropagation();
}

function handleKeyDown(e) {
  if (e.key === 'Escape') {
    cleanup();
    chrome.runtime.sendMessage({ action: 'cancelScreenshot' });
  }
}

function cleanup() {
  if (overlay) {
    overlay.remove();
    overlay = null;
  }
  document.body.style.overflow = '';
  document.removeEventListener('keydown', handleKeyDown);
}

// Listen for messages from popup and background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startScreenshot') {
    createOverlay();
    sendResponse({ success: true });
  } else if (request.action === 'stopScreenshot') {
    cleanup();
    sendResponse({ success: true });
  } else if (request.action === 'cropScreenshot') {
    // Crop the full screenshot to the selected area
    cropScreenshot(request.fullScreenshot, request.selection)
      .then(croppedImage => {
        sendResponse({ croppedImage: croppedImage });
        // Store in chrome.storage for popup to retrieve
        chrome.storage.local.set({ pendingScreenshot: croppedImage }, () => {
          // Try to send message to popup (might be closed)
          chrome.runtime.sendMessage({
            action: 'screenshotCaptured',
            imageData: croppedImage
          });
        });
      })
      .catch(error => {
        console.error('Error cropping screenshot:', error);
        sendResponse({ error: error.message });
        chrome.runtime.sendMessage({
          action: 'screenshotError',
          error: error.message
        });
      });
    return true; // Keep channel open for async
  }
  return true;
});

function cropScreenshot(fullScreenshotDataUrl, selection) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Get device pixel ratio for high DPI screens
      const dpr = window.devicePixelRatio || 1;
      
      // Calculate scale factor between screenshot and viewport
      const scaleX = img.width / window.innerWidth;
      const scaleY = img.height / window.innerHeight;
      
      // Scale selection coordinates
      const scaledX = selection.x * scaleX;
      const scaledY = selection.y * scaleY;
      const scaledWidth = selection.width * scaleX;
      const scaledHeight = selection.height * scaleY;
      
      // Set canvas to selection size
      canvas.width = scaledWidth;
      canvas.height = scaledHeight;
      
      // Draw cropped portion
      ctx.drawImage(
        img,
        scaledX, scaledY, scaledWidth, scaledHeight,
        0, 0, scaledWidth, scaledHeight
      );
      
      // Convert to data URL
      const croppedDataUrl = canvas.toDataURL('image/png');
      resolve(croppedDataUrl);
    };
    
    img.onerror = () => reject(new Error('Failed to load screenshot'));
    img.src = fullScreenshotDataUrl;
  });
}

