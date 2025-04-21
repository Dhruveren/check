document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.getElementById('toggle');
  const status = document.getElementById('status');

  // Set default state
  toggle.checked = false;
  status.textContent = "Off";

  // Get initial state
  chrome.runtime.sendMessage({ action: "getState" }, function(response) {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }
    if (response && response.state !== undefined) {
      toggle.checked = response.state;
      status.textContent = response.state ? "On" : "Off";
    }
  });

  // Handle toggle changes
  toggle.addEventListener('change', function() {
    const isActive = toggle.checked;
    status.textContent = isActive ? "On" : "Off";
    
    chrome.runtime.sendMessage({ 
      action: "toggle", 
      state: isActive 
    }, function(response) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      }
    });
  });
}); 