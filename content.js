// Listen for all image right-clicks to intercept "save image" actions
document.addEventListener('contextmenu', function(event) {
    if (event.target.tagName === 'IMG') {
      const imageUrl = event.target.src;
      console.log("Image context menu detected:", imageUrl);
      
      // Check if URL contains suspicious patterns
      chrome.runtime.sendMessage({ 
        action: "checkImage", 
        url: imageUrl 
      });
    }
  });
  
  // Listen for image drag events to catch drag-and-drop saving
  document.addEventListener('dragstart', function(event) {
    if (event.target.tagName === 'IMG') {
      const imageUrl = event.target.src;
      console.log("Image drag detected:", imageUrl);
      
      // Check if URL contains suspicious patterns
      chrome.runtime.sendMessage({ 
        action: "checkImage", 
        url: imageUrl 
      });
    }
  });