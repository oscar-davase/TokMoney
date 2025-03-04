document.addEventListener('DOMContentLoaded', function() {
  const refreshBtn = document.getElementById('refresh-btn');
  const rpmRange = document.getElementById('rpm-range');
  const rpmProgress = document.querySelector('.rpm-progress');
  const currentRpmDisplay = document.getElementById('current-rpm');
  const eligibilityAlert = document.getElementById('eligibility-alert');
  const eligibilityMessage = document.getElementById('eligibility-message');
  
  // RPM values
  const rpmValues = [0.20, 0.45, 0.70];
  
  // Default RPM value (middle position)
  let currentRpm = rpmValues[1];
  
  // Update RPM display and progress bar
  function updateRpmDisplay() {
    const rangeValue = parseInt(rpmRange.value);
    currentRpm = rpmValues[rangeValue];
    
    // Update display
    currentRpmDisplay.textContent = currentRpm.toFixed(2).replace('.', ',') + '€';
    
    // Update progress bar width based on range position
    const progressWidth = (rangeValue / (rpmValues.length - 1)) * 100;
    rpmProgress.style.width = `${progressWidth}%`;
    
    // Send message to content script to update RPM
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { 
        action: 'updateRPM', 
        rpm: currentRpm 
      });
    });
  }
  
  // Range input event handler
  rpmRange.addEventListener('input', updateRpmDisplay);
  
  // Check if we're on a TikTok profile page and check eligibility
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentUrl = tabs[0].url;
    
    if (!currentUrl.includes('tiktok.com/@')) {
      refreshBtn.disabled = true;
      refreshBtn.textContent = 'Not available';
      refreshBtn.style.backgroundColor = '#ccc';
      
      const content = document.getElementById('content');
      content.innerHTML = '<p class="error-message">Please open a TikTok profile to see earnings estimates.</p>';
      return;
    }
    
    // Check for follower count and views to determine eligibility
    chrome.tabs.sendMessage(tabs[0].id, { action: 'checkEligibility' }, function(response) {
      if (response && response.followerCount !== undefined) {
        const hasEnoughFollowers = response.hasEnoughFollowers;
        const hasEnoughViews = response.hasEnoughViews;
        const isEligible = hasEnoughFollowers && hasEnoughViews;
        
        if (!isEligible) {
          // Create specific message based on what criteria are not met
          let message = "Ce compte ne remplit pas les conditions d'éligibilité à la monétisation TikTok: ";
          
          if (!hasEnoughFollowers && !hasEnoughViews) {
            message += `moins de 10 000 abonnés (<span class="current-value">${formatNumber(response.followerCount)}</span> actuellement) et moins de 100 000 vues sur les 30 derniers jours (<span class="current-value">${formatNumber(response.recentViews)}</span> actuellement).`;
          } else if (!hasEnoughFollowers) {
            message += `moins de 10 000 abonnés (<span class="current-value">${formatNumber(response.followerCount)}</span> actuellement).`;
          } else if (!hasEnoughViews) {
            message += `moins de 100 000 vues sur les 30 derniers jours (<span class="current-value">${formatNumber(response.recentViews)}</span> actuellement).`;
          }
          
          message += " Les montants affichés sont une estimation de ce qu'il aurait pu générer s'il était éligible.";
          
          eligibilityMessage.innerHTML = message;
          eligibilityAlert.classList.add('visible');
        }
      }
    });
  });
  
  // Format numbers with commas for thousands
  function formatNumber(num) {
    return Math.round(num).toLocaleString();
  }
  
  // Refresh button click handler
  refreshBtn.addEventListener('click', function() {
    // Disable button during processing
    refreshBtn.disabled = true;
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { 
        action: 'analyzeVideos',
        rpm: currentRpm
      }, function(response) {
        if (response && response.success) {
          // Change text and add success class
          refreshBtn.textContent = 'Estimations rafraîchies';
          refreshBtn.classList.add('success');
          
          // Reset after 2 seconds
          setTimeout(() => {
            refreshBtn.textContent = 'Rafraîchir les estimations';
            refreshBtn.classList.remove('success');
            refreshBtn.disabled = false;
          }, 2000);
        } else {
          refreshBtn.textContent = 'Error, try again';
          setTimeout(() => {
            refreshBtn.textContent = 'Rafraîchir les estimations';
            refreshBtn.disabled = false;
          }, 2000);
        }
      });
    });
  });
  
  // Keep popup open when clicking inside it
  document.addEventListener('click', function(event) {
    event.stopPropagation();
  });
});