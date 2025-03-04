/**
 * TokMoney - TikTok Earnings Estimator
 * 
 * This content script analyzes TikTok videos and displays estimated earnings
 * based on view counts and monetization eligibility.
 */

// Constants for revenue calculation
let RPM_LOW = 0.20;    // €0.20 per 1000 eligible views
let RPM_MEDIUM = 0.45; // €0.45 per 1000 eligible views
let RPM_HIGH = 0.70;   // €0.70 per 1000 eligible views
let RPM_AVERAGE = RPM_MEDIUM; // Default RPM
const ELIGIBLE_PERCENTAGE = 0.40; // 40% of views are eligible for monetization

// Flag to control automatic analysis
let autoAnalysisEnabled = false;

// Function to parse view count text (handles K, M, B suffixes)
function parseViewCount(viewText) {
  if (!viewText) return 0;
  
  console.log('Analyzing view text:', viewText);
  
  // Extract just the numeric part with suffix
  const numericMatch = viewText.match(/(\d+[.,]?\d*\s*[KMBkmb]?)/);
  if (!numericMatch) return 0;
  
  let numericPart = numericMatch[0].replace(/[^0-9KMBkmb.,]/g, '');
  
  console.log('Extracted numeric part:', numericPart);
  
  // Replace comma with dot for decimal parsing
  numericPart = numericPart.replace(',', '.');
  
  let multiplier = 1;
  
  if (numericPart.includes('K') || numericPart.includes('k')) {
    multiplier = 1000;
    numericPart = numericPart.replace(/[Kk]/g, '');
    console.log('K suffix detected, multiplier =', multiplier);
  } else if (numericPart.includes('M') || numericPart.includes('m')) {
    multiplier = 1000000;
    numericPart = numericPart.replace(/[Mm]/g, '');
    console.log('M suffix detected, multiplier =', multiplier);
  } else if (numericPart.includes('B') || numericPart.includes('b')) {
    multiplier = 1000000000;
    numericPart = numericPart.replace(/[Bb]/g, '');
    console.log('B suffix detected, multiplier =', multiplier);
  }
  
  const value = parseFloat(numericPart) * multiplier;
  console.log('Final calculated value:', value);
  return isNaN(value) ? 0 : value;
}

// Function to format currency
function formatCurrency(amount) {
  return amount.toFixed(2) + '€';
}

// Function to check if the container contains a video or an image
function isVideo(container) {
  // Check for source element with type="image/avif"
  const sourceElement = container.querySelector('source[type="image/avif"]');
  console.log('Checking if video:', sourceElement ? 'Yes, AVIF source found' : 'No, no AVIF source');
  return !!sourceElement;
}

// Function to create and add earnings badge to a video container
function addEarningsBadge(container, views, isVideoContent, showLoadingFirst = false) {
  // Remove any existing badge first
  const existingBadge = container.querySelector('.tiktok-earnings-badge');
  if (existingBadge) {
    existingBadge.remove();
  }
  
  // Create badge element
  const badge = document.createElement('div');
  badge.className = 'tiktok-earnings-badge';
  badge.style.position = 'absolute';
  badge.style.top = '10px';
  badge.style.right = '10px';
  badge.style.padding = '4px 8px';
  badge.style.borderRadius = '4px';
  badge.style.fontSize = '14px';
  badge.style.fontWeight = 'bold';
  badge.style.zIndex = '999';
  badge.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.3)';
  
  // Add backdrop blur effect for better readability
  badge.style.backdropFilter = 'blur(3px)';
  badge.style.webkitBackdropFilter = 'blur(3px)';
  
  if (showLoadingFirst) {
    // Show loading spinner first
    badge.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    badge.style.color = 'white';
    badge.style.display = 'flex';
    badge.style.alignItems = 'center';
    badge.style.justifyContent = 'center';
    badge.style.minWidth = '40px';
    badge.style.minHeight = '24px';
    
    // Create spinner
    const spinner = document.createElement('div');
    spinner.className = 'tiktok-earnings-spinner';
    spinner.style.width = '14px';
    spinner.style.height = '14px';
    spinner.style.border = '2px solid rgba(255, 255, 255, 0.3)';
    spinner.style.borderRadius = '50%';
    spinner.style.borderTop = '2px solid white';
    spinner.style.animation = 'tiktok-earnings-spin 0.8s linear infinite';
    
    // Add spinner animation
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes tiktok-earnings-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(styleSheet);
    
    badge.appendChild(spinner);
    
    // Add badge to container
    container.style.position = 'relative';
    container.appendChild(badge);
    
    // After a short delay, update with actual value
    setTimeout(() => {
      updateBadgeWithValue(badge, views, isVideoContent);
    }, 500);
  } else {
    // Show value immediately
    updateBadgeWithValue(badge, views, isVideoContent);
    
    // Add badge to container
    container.style.position = 'relative';
    container.appendChild(badge);
  }
  
  return badge;
}

// Function to update badge with actual value
function updateBadgeWithValue(badge, views, isVideoContent) {
  // Remove any existing spinner
  const spinner = badge.querySelector('.tiktok-earnings-spinner');
  if (spinner) {
    spinner.remove();
  }
  
  if (isVideoContent) {
    // Calculate earnings for videos
    const eligibleViews = views * ELIGIBLE_PERCENTAGE;
    const earnings = eligibleViews * RPM_AVERAGE / 1000;
    
    badge.style.backgroundColor = 'rgba(0, 182, 122, 0.85)'; // #00B67A with opacity
    badge.style.color = 'white';
    badge.textContent = formatCurrency(earnings);
    badge.title = `Estimated earnings for ${views.toLocaleString()} views\n${Math.round(eligibleViews).toLocaleString()} eligible views (about 40%)\nBased on an average RPM of ${RPM_AVERAGE.toFixed(2)}€ per 1000 views`;
  } else {
    // For non-eligible content, show 0€
    badge.style.backgroundColor = 'rgba(254, 44, 85, 0.85)';
    badge.style.color = 'white';
    badge.textContent = '0€';
    badge.title = 'Content not eligible for revenue';
  }
}

// Function to analyze a single video container
function analyzeVideoContainer(container, showLoadingFirst = false) {
  try {
    console.log('\n--- Analyzing video container ---');
    
    // Find view count element
    let viewElement = null;
    
    // Try different selectors for view counts
    const viewSelectors = [
      '[data-e2e="video-views"]',
      '.video-count',
      '.view-count',
      'strong[class*="StrongVideoCount"]',
      'span[class*="SpanViewCount"]',
      'div[class*="DivPlayCount"]'
    ];
    
    for (const selector of viewSelectors) {
      try {
        const element = container.querySelector(selector);
        if (element) {
          viewElement = element;
          console.log(`✅ View element found with selector "${selector}"`);
          break;
        }
      } catch (err) {
        console.log(`Error with selector ${selector}:`, err);
      }
    }
    
    // If no view element found with selectors, try to find by text content
    if (!viewElement) {
      console.log('Searching for view elements by text content...');
      const allElements = container.querySelectorAll('span, div, strong');
      for (const element of allElements) {
        try {
          const text = element.textContent.trim();
          // Match patterns like "1.2M views", "1,2M vues", "1.2K", etc.
          if (/^\d+(\.\d+)?(K|M|B|k|m|b)?\s*(views|vues|visualizaciones)?$/.test(text)) {
            viewElement = element;
            console.log(`✅ View element found by text content: "${text}"`);
            break;
          }
        } catch (err) {
          console.log("Error analyzing text:", err);
        }
      }
    }
    
    if (!viewElement) {
      console.log('❌ No view element found');
      return false; // Skip this container
    }
    
    const viewText = viewElement.textContent.trim();
    const views = parseViewCount(viewText);
    
    if (views <= 0) {
      console.log('❌ Invalid view count:', viewText);
      return false; // Skip this container
    }
    
    // Check if this is a video or an image
    const isVideoContent = isVideo(container);
    console.log(`Content type: ${isVideoContent ? 'Video' : 'Image'}`);
    
    // Add earnings badge
    addEarningsBadge(container, views, isVideoContent, showLoadingFirst);
    
    return true;
  } catch (error) {
    console.error('Error analyzing video container:', error);
    return false;
  }
}

// Function to find and analyze all video containers on the page
function analyzeAllVideos(showLoadingFirst = true) {
  console.log('=== STARTING TIKTOK VIDEO ANALYSIS ===');
  console.log(`Current RPM used: ${RPM_AVERAGE}€`);
  
  // Try multiple selectors to find video containers
  const videoContainerSelectors = [
    'div[data-e2e="user-post-item"]',
    '.video-feed-item',
    '.tiktok-x6y88p-DivItemContainerV2',
    '.tiktok-yz6ijl-DivWrapper',
    '.video-item',
    'div[class*="DivItemContainer"]',
    'div[class*="DivVideoFeed"] > div',
    'div[class*="user-post-item"]'
  ];
  
  let videoContainers = [];
  
  // Try each selector until we find elements
  for (const selector of videoContainerSelectors) {
    console.log(`Searching for video containers with "${selector}"...`);
    const elements = document.querySelectorAll(selector);
    if (elements && elements.length > 0) {
      videoContainers = Array.from(elements);
      console.log(`✅ ${elements.length} video containers found with "${selector}"`);
      break;
    }
  }
  
  // If no video containers found, try a more generic approach
  if (videoContainers.length === 0) {
    console.log('Searching for video containers by structure...');
    
    const possibleContainers = document.querySelectorAll('div[class*="video"], div[class*="feed-item"]');
    if (possibleContainers.length > 0) {
      videoContainers = Array.from(possibleContainers);
      console.log(`✅ ${possibleContainers.length} potential video containers found`);
    }
  }
  
  if (videoContainers.length === 0) {
    console.log('❌ No video containers found');
    return;
  }
  
  // Analyze each container
  let analyzedCount = 0;
  videoContainers.forEach((container, index) => {
    console.log(`\n--- Analyzing video container #${index + 1} ---`);
    if (analyzeVideoContainer(container, showLoadingFirst)) {
      analyzedCount++;
    }
  });
  
  console.log(`\n=== ANALYSIS SUMMARY ===`);
  console.log(`Total videos analyzed: ${analyzedCount} out of ${videoContainers.length}`);
  console.log(`=== END OF ANALYSIS ===`);
}

// Function to update RPM values
function updateRPM(newRPM) {
  console.log(`Updating RPM: ${newRPM}€`);
  RPM_AVERAGE = newRPM;
  
  // Update all existing badges
  const badges = document.querySelectorAll('.tiktok-earnings-badge');
  if (badges.length > 0) {
    console.log(`Updating ${badges.length} existing badges...`);
    analyzeAllVideos();
  }
}

// Function to enable or disable auto analysis
function setAutoAnalysis(enabled) {
  autoAnalysisEnabled = enabled;
  console.log(`Auto analysis ${enabled ? 'enabled' : 'disabled'}`);
}

// Function to check if the profile is eligible for monetization
function checkProfileEligibility() {
  console.log('Checking profile eligibility...');
  
  // Try different selectors for follower count
  const followerSelectors = [
    '[data-e2e="followers-count"]',
    'strong[data-e2e="followers"]',
    'span[class*="SpanFollowerCount"]',
    'div[class*="DivFollowerCount"]',
    'h2[data-e2e="followers"]'
  ];
  
  let followerElement = null;
  
  for (const selector of followerSelectors) {
    try {
      const element = document.querySelector(selector);
      if (element) {
        followerElement = element;
        console.log(`✅ Follower element found with selector "${selector}"`);
        break;
      }
    } catch (err) {
      console.log(`Error with selector ${selector}:`, err);
    }
  }
  
  // If no follower element found with selectors, try to find by text content
  if (!followerElement) {
    console.log('Searching for follower elements by text content...');
    const allElements = document.querySelectorAll('span, div, strong, h2');
    for (const element of allElements) {
      try {
        const text = element.textContent.trim();
        // Match patterns like "1.2M followers", "1,2M abonnés", etc.
        if (/^\d+(\.\d+)?(K|M|B|k|m|b)?\s*(followers|abonnés|seguidores)?$/i.test(text)) {
          followerElement = element;
          console.log(`✅ Follower element found by text content: "${text}"`);
          break;
        }
      } catch (err) {
        console.log("Error analyzing text:", err);
      }
    }
  }
  
  if (!followerElement) {
    console.log('❌ No follower element found');
    return { followerCount: 0, recentViews: 0, isEligible: false };
  }
  
  const followerText = followerElement.textContent.trim();
  const followerCount = parseViewCount(followerText);
  
  console.log(`Follower count: ${followerCount}`);
  
  // Estimate recent views (last 30 days)
  // This is a rough estimation based on visible videos
  let recentViews = 0;
  
  // Try to find video containers
  const videoContainers = document.querySelectorAll('div[data-e2e="user-post-item"], .video-feed-item');
  if (videoContainers.length > 0) {
    let totalViews = 0;
    let videoCount = 0;
    
    // Check up to 10 most recent videos
    const maxVideos = Math.min(10, videoContainers.length);
    
    for (let i = 0; i < maxVideos; i++) {
      const container = videoContainers[i];
      const viewElement = container.querySelector('[data-e2e="video-views"], .video-count, .view-count');
      
      if (viewElement) {
        const views = parseViewCount(viewElement.textContent);
        if (views > 0) {
          totalViews += views;
          videoCount++;
        }
      }
    }
    
    if (videoCount > 0) {
      // Calculate average views per video
      const avgViews = totalViews / videoCount;
      
      // Estimate monthly views (assuming ~15 videos per month for active creators)
      recentViews = avgViews * 15;
      console.log(`Estimated recent views (30 days): ${Math.round(recentViews)}`);
    }
  }
  
  // Check eligibility criteria
  const hasEnoughFollowers = followerCount >= 10000;
  const hasEnoughViews = recentViews >= 100000;
  const isEligible = hasEnoughFollowers && hasEnoughViews;
  
  console.log(`Profile ${isEligible ? 'eligible' : 'not eligible'} for monetization`);
  
  return { 
    followerCount, 
    recentViews,
    hasEnoughFollowers,
    hasEnoughViews,
    isEligible 
  };
}

// Create a MutationObserver to detect when new videos are loaded
const observer = new MutationObserver(mutations => {
  if (!autoAnalysisEnabled) return;
  
  let newContainersFound = false;
  
  mutations.forEach(mutation => {
    if (mutation.addedNodes && mutation.addedNodes.length > 0) {
      // Check if any of the added nodes are video containers or contain video containers
      mutation.addedNodes.forEach(node => {
        // Check if the node itself is a video container
        if (node.nodeType === 1) { // Element node
          const containerSelectors = [
            'div[data-e2e="user-post-item"]',
            '.video-feed-item',
            '.tiktok-x6y88p-DivItemContainerV2',
            '.tiktok-yz6ijl-DivWrapper',
            '.video-item',
            'div[class*="DivItemContainer"]'
          ];
          
          for (const selector of containerSelectors) {
            if (node.matches && node.matches(selector)) {
              analyzeVideoContainer(node, true);
              newContainersFound = true;
              break;
            }
          }
          
          // Check if the node contains video containers
          const containers = node.querySelectorAll ? 
            node.querySelectorAll('div[data-e2e="user-post-item"], .video-feed-item, .tiktok-x6y88p-DivItemContainerV2, .tiktok-yz6ijl-DivWrapper, .video-item, div[class*="DivItemContainer"]') : 
            [];
          
          if (containers.length > 0) {
            containers.forEach(container => {
              analyzeVideoContainer(container, true);
              newContainersFound = true;
            });
          }
        }
      });
    }
  });
  
  if (newContainersFound) {
    console.log('New video containers detected and analyzed');
  }
});

// Start observing the document with the configured parameters
observer.observe(document.body, { childList: true, subtree: true });

// Initial analysis when the script loads - disabled by default
window.addEventListener('load', () => {
  // Don't auto-analyze on load
  // setTimeout(analyzeAllVideos, 1000);
});

// Re-analyze when scrolling stops (to catch dynamically loaded content)
let scrollTimeout;
window.addEventListener('scroll', () => {
  if (!autoAnalysisEnabled) return;
  
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => analyzeAllVideos(true), 500);
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeVideos') {
    // Update RPM if provided
    if (request.rpm) {
      updateRPM(request.rpm);
    }
    
    // Enable auto-analysis for future scrolling
    setAutoAnalysis(true);
    
    // Analyze all videos
    analyzeAllVideos(true);
    sendResponse({ success: true });
  } else if (request.action === 'updateRPM') {
    updateRPM(request.rpm);
    sendResponse({ success: true });
  } else if (request.action === 'checkEligibility') {
    const eligibility = checkProfileEligibility();
    sendResponse(eligibility);
  }
  return true;
});