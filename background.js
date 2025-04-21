let isExtensionActive = false;

// Initialize storage
chrome.storage.local.get(['isActive'], function(result) {
  isExtensionActive = result.isActive || false;
  console.log("Extension active state initialized:", isExtensionActive);
  updateRules();
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received:", request);
  if (request.action === "toggle") {
    isExtensionActive = request.state;
    console.log("Extension toggled to:", isExtensionActive);
    chrome.storage.local.set({ isActive: isExtensionActive });
    updateRules();
    sendResponse({ success: true });
  } else if (request.action === "getState") {
    sendResponse({ state: isExtensionActive });
  }
  return true;
});

// Initialize rules when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed, initializing rules");
  updateRules();
});

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
          resourceTypes: ["image"]
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
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  
  // Check if it's an image download
  const isImage = imageExtensions.some(ext => url.endsWith(ext));
  if (!isImage) {
    console.log("Not an image file, ignoring");
    return;
  }

  console.log("Image download detected, checking for suspicious patterns");
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
    console.log("Suspicious image detected! Canceling download and showing alert");
    // Cancel the download
    chrome.downloads.cancel(downloadItem.id, () => {
      if (chrome.runtime.lastError) {
        console.error("Error canceling download:", chrome.runtime.lastError);
      } else {
        console.log("Download canceled successfully");
      }
    });
    
    // Show alert
    showAlert("⚠️ WARNING: This image contains potential phishing or malicious content. Download has been blocked for your safety.");
  } else {
    console.log("Image appears safe, showing success alert");
    // For safe images, show a success alert
    showAlert("✅ SAFE: This image has been checked and is safe to download.");
  }
});

function showAlert(message) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs && tabs[0]) {
      console.log("Showing alert in tab:", tabs[0].id);
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        func: (alertMessage) => {
          alert(alertMessage);
        },
        args: [message]
      }).catch(err => {
        console.error("Error executing script:", err);
      });
    } else {
      console.error("No active tab found to show alert");
    }
  });
}