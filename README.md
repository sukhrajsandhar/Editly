# Editly - Modern Image Editor Chrome Extension

A beautiful, modern Chrome extension for uploading images, taking screenshots, and editing them with a sleek dark mode interface.

## Features

- 📁 **Upload Images** - Upload images from your device
- 📷 **Take Screenshot** - Capture the current browser tab
- ✏️ **Edit Image** - Adjust brightness, contrast, saturation, and blur
- 💾 **Save Image** - Download edited images
- 🌙 **Dark Mode Toggle** - Switch between light and dark themes
- ✨ **Smooth Animations** - Beautiful hover effects and transitions

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top right)
3. Click "Load unpacked"
4. Select the `Editly` folder
5. The extension icon will appear in your toolbar

## Usage

1. Click the extension icon to open the popup
2. **Upload Image**: Click "Upload Image" to select a file from your device
3. **Take Screenshot**: Click "Take Screenshot" to capture the current tab
4. **Edit Image**: Click "Edit Image" to open editing controls
   - Adjust brightness, contrast, saturation, and blur
   - Click "Reset Filters" to restore original values
5. **Save**: Click "Save" to download the edited image

## Note on Icons

The manifest references icon files (`icon16.png`, `icon48.png`, `icon128.png`). If these files don't exist, Chrome will use a default icon. To add custom icons:

1. Create PNG images with sizes 16x16, 48x48, and 128x128 pixels
2. Place them in the extension folder
3. Reload the extension

## Files Structure

```
Editly/
├── manifest.json    # Extension configuration
├── popup.html       # Main UI structure
├── popup.css        # Styling with dark mode
├── popup.js         # Functionality and logic
└── README.md        # This file
```

## Browser Compatibility

Requires Chrome/Chromium browser with Manifest V3 support.

