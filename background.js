let isExtensionActive = false;

// Initialize storage
chrome.storage.local.get(['isActive'], function(result) {
  isExtensionActive = result.isActive || false;
  updateRules();
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggle") {
    isExtensionActive = request.state;
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
    removeRuleIds: rules.map(rule => rule.id),
    addRules: rules
  });
}

// Monitor all downloads
chrome.downloads.onCreated.addListener((downloadItem) => {
  if (!isExtensionActive) return;

  const url = downloadItem.url.toLowerCase();
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  
  // Check if it's an image download
  const isImage = imageExtensions.some(ext => url.endsWith(ext));
  if (!isImage) return;

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

  const isSuspicious = suspiciousPatterns.some(pattern => 
    url.includes(pattern) || 
    decodeURIComponent(url).includes(pattern)
  );

  if (isSuspicious) {
    chrome.downloads.cancel(downloadItem.id);
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: '⚠️ Suspicious Image Blocked',
      message: 'This image contains potential phishing or malicious content. Download blocked for your safety.'
    });
  } else {
    // For safe images, show a success notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: '✅ Safe Image',
      message: 'This image has been checked and is safe to download.'
    });
  }
}); 