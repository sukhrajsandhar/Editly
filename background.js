// Background script to handle screenshot capture
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'captureSelection') {
    // Capture the full visible tab
    chrome.tabs.captureVisibleTab(null, {
      format: 'png',
      quality: 100
    }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        console.error('Capture error:', chrome.runtime.lastError);
        chrome.runtime.sendMessage({
          action: 'screenshotError',
          error: chrome.runtime.lastError.message
        });
        return;
      }
      
      // Send the full screenshot to content script to crop
      chrome.tabs.sendMessage(sender.tab.id, {
        action: 'cropScreenshot',
        fullScreenshot: dataUrl,
        selection: request.selection
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Content script error:', chrome.runtime.lastError);
          chrome.runtime.sendMessage({
            action: 'screenshotError',
            error: chrome.runtime.lastError.message
          });
        }
        // Response is handled in content script
      });
    });
    return true; // Keep channel open
  }
});

