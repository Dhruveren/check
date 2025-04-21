// Global state
let isExtensionActive = true;

// Initialize extension state from storage
chrome.storage.local.get('isActive', (result) => {
  isExtensionActive = result.isActive !== undefined ? result.isActive : true;
  console.log("Extension initialized, active:", isExtensionActive);
  updateRules();
});

// Update blocking rules based on extension state
function updateRules() {
  const suspiciousPatterns = [
    'phish',
    'malware',
    'hack',
    'virus',
    'trojan',
    'spyware',
    'ransomware',
    'keylogger',
    'stealer',
    'exploit',
    'fraud',
    'scam',
    'fake',
    'dangerous',
    'malicious'
  ];

  const rules = [];
  
  if (isExtensionActive) {
    console.log("Creating blocking rules for suspicious patterns");
    // Create rules for each suspicious pattern
    suspiciousPatterns.forEach((pattern, index) => {
      rules.push({
        id: index + 1,
        priority: 1,
        action: { type: "block" },
        condition: {
          urlFilter: `*${pattern}*`,
          resourceTypes: ["image", "media", "object"] // Add more resource types
        }
      });
    });
  }

  // Update rules
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: Array.from({length: suspiciousPatterns.length}, (_, i) => i + 1),
    addRules: rules
  }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error updating rules:", chrome.runtime.lastError);
    } else {
      console.log("Rules updated successfully. Total rules:", rules.length);
    }
  });
}

// Monitor all downloads
chrome.downloads.onCreated.addListener((downloadItem) => {
  console.log("Download detected:", downloadItem);
  
  if (!isExtensionActive) {
    console.log("Extension is not active, ignoring download");
    return;
  }

  console.log("Checking download:", downloadItem.url);
  const url = downloadItem.url.toLowerCase();
  const filename = downloadItem.filename.toLowerCase();
  
  // Check MIME type and file extension
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
  
  // Check if it's an image download by extension or MIME type
  const isImageByExt = imageExtensions.some(ext => filename.endsWith(ext) || url.endsWith(ext));
  const isImageByMime = downloadItem.mime && imageMimeTypes.includes(downloadItem.mime);
  const isImage = isImageByExt || isImageByMime;
  
  if (!isImage) {
    console.log("Not an image file, ignoring");
    return;
  }

  console.log("Image download detected, checking for suspicious patterns");
  // Rest of your code remains the same...
});

// Monitor image requests
chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    if (!isExtensionActive) return { cancel: false };
    
    const url = details.url.toLowerCase();
    console.log("Image request detected:", url);
    
    // Check for suspicious patterns in the URL
    const suspiciousPatterns = [
      'phish',
      'malware',
      'hack',
      'virus',
      'trojan',
      'spyware',
      'ransomware',
      'keylogger',
      'stealer',
      'exploit',
      'fraud',
      'scam',
      'fake',
      'dangerous',
      'malicious'
    ];

    const isSuspicious = suspiciousPatterns.some(pattern => {
      return url.includes(pattern) || decodeURIComponent(url).includes(pattern);
    });

    if (isSuspicious) {
      console.log("Blocked suspicious image:", url);
      return { cancel: true };
    }
    
    return { cancel: false };
  },
  { urls: ["<all_urls>"], types: ["image"] },
  ["blocking"]
);

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received:", request);
  if (request.action === "toggle") {
    isExtensionActive = request.active;
    console.log("Extension active state changed to:", isExtensionActive);
    
    // Save state
    chrome.storage.local.set({ isActive: isExtensionActive });
    
    // Update rules
    updateRules();
    
    sendResponse({ success: true, active: isExtensionActive });
  } else if (request.action === "getState") {
    sendResponse({ active: isExtensionActive });
  } else if (request.action === "checkImage") {
    if (!isExtensionActive) {
      console.log("Extension is not active, ignoring image check");
      return true;
    }
    
    const url = request.url.toLowerCase();
    console.log("Checking image URL:", url);
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      'phish',
      'malware',
      'hack',
      'virus',
      'trojan',
      'spyware',
      'ransomware',
      'keylogger',
      'stealer',
      'exploit',
      'fraud',
      'scam',
      'fake',
      'dangerous',
      'malicious'
    ];

    const isSuspicious = suspiciousPatterns.some(pattern => {
      const contains = url.includes(pattern) || decodeURIComponent(url).includes(pattern);
      if (contains) console.log("Found suspicious pattern:", pattern);
      return contains;
    });

    if (isSuspicious) {
      console.log("Suspicious image detected! Showing alert");
      // Show alert
      if (sender.tab) {
        chrome.scripting.executeScript({
          target: {tabId: sender.tab.id},
          func: () => {
            alert("⚠️ WARNING: This image contains potential phishing or malicious content.");
          }
        }).catch(err => {
          console.error("Error executing script:", err);
        });
      }
    } else {
      console.log("Image appears safe");
    }
  }
  return true;
});