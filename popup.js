document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.getElementById('toggle');
  const status = document.getElementById('status');

  // Get initial state
  chrome.runtime.sendMessage({ action: "getState" }, function(response) {
    if (chrome.runtime.lastError) {
      console.error("Error getting state:", chrome.runtime.lastError);
      return;
    }
    
    console.log("Got state from background:", response);
    if (response && response.state !== undefined) {
      toggle.checked = response.state;
      status.textContent = response.state ? "On" : "Off";
      console.log("Extension state set to:", response.state ? "On" : "Off");
    } else {
      console.log("No state returned, defaulting to Off");
      toggle.checked = false;
      status.textContent = "Off";
    }
  });

  // Handle toggle changes
  toggle.addEventListener('change', function() {
    const isActive = toggle.checked;
    status.textContent = isActive ? "On" : "Off";
    console.log("Toggle changed to:", isActive);
    
    chrome.runtime.sendMessage({ 
      action: "toggle", 
      state: isActive 
    }, function(response) {
      if (chrome.runtime.lastError) {
        console.error("Error toggling state:", chrome.runtime.lastError);
        return;
      }
      
      console.log("Toggle response:", response);
      if (response && response.success) {
        console.log("Extension state successfully updated");
      }
    });
  });
});