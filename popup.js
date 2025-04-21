// Initialize popup UI based on current extension state
document.addEventListener('DOMContentLoaded', function() {
  const toggleElement = document.getElementById('toggleProtection');
  const statusElement = document.getElementById('status');
  
  // Get current state from background script
  chrome.runtime.sendMessage({ action: "getState" }, function(response) {
    if (response && response.active !== undefined) {
      toggleElement.checked = response.active;
      updateStatusText(response.active);
    }
  });
  
  // Handle toggle switch changes
  toggleElement.addEventListener('change', function() {
    const isActive = toggleElement.checked;
    
    // Update status text
    updateStatusText(isActive);
    
    // Send message to background script
    chrome.runtime.sendMessage({ 
      action: "toggle", 
      active: isActive 
    }, function(response) {
      console.log("Toggle response:", response);
    });
  });
  
  function updateStatusText(isActive) {
    statusElement.textContent = isActive ? 
      "Protection is active" : 
      "Protection is disabled";
    statusElement.style.color = isActive ? "#4CAF50" : "#F44336";
  }
});