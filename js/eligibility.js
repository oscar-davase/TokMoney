/**
 * Eligibility checker module for TokMoney
 * Checks if a TikTok profile meets monetization requirements
 */

// Minimum requirements for TikTok monetization
const MINIMUM_FOLLOWERS = 10000;
const MINIMUM_RECENT_VIEWS = 100000;

/**
 * Parse numeric values from text (handles K, M, B suffixes)
 * @param {string} text - Text containing a number with possible suffix
 * @returns {number} - Parsed numeric value
 */
function parseNumericValue(text) {
  if (!text) return 0;
  
  // Extract just the numeric part with suffix
  const numericMatch = text.match(/(\d+[.,]?\d*\s*[KMBkmb]?)/);
  if (!numericMatch) return 0;
  
  let numericPart = numericMatch[0].replace(/[^0-9KMBkmb.,]/g, '');
  
  // Replace comma with dot for decimal parsing
  numericPart = numericPart.replace(',', '.');
  
  let multiplier = 1;
  
  if (numericPart.includes('K') || numericPart.includes('k')) {
    multiplier = 1000;
    numericPart = numericPart.replace(/[Kk]/g, '');
  } else if (numericPart.includes('M') || numericPart.includes('m')) {
    multiplier = 1000000;
    numericPart = numericPart.replace(/[Mm]/g, '');
  } else if (numericPart.includes('B') || numericPart.includes('b')) {
    multiplier = 1000000000;
    numericPart = numericPart.replace(/[Bb]/g, '');
  }
  
  const value = parseFloat(numericPart) * multiplier;
  return isNaN(value) ? 0 : value;
}

/**
 * Find follower count on a TikTok profile page
 * @returns {number} - Number of followers
 */
function findFollowerCount() {
  console.log('Checking follower count...');
  
  // Try different selectors for follower count
  const followerSelectors = [
    '[data-e2e="followers-count"]',
    'strong[data-e2e="followers"]',
    'span[class*="SpanFollowerCount"]',
    'div[class*="DivFollowerCount"]',
    'h2[data-e2e="followers"]'
  ];
  
  let followerElement = null;
  
  // Try each selector
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
    return 0;
  }
  
  const followerText = followerElement.textContent.trim();
  return parseNumericValue(followerText);
}

/**
 * Estimate recent views by analyzing visible videos
 * @returns {number} - Estimated recent views (last 30 days)
 */
function estimateRecentViews() {
  console.log('Estimating recent views...');
  
  // Try to find video containers
  const videoContainerSelectors = [
    'div[data-e2e="user-post-item"]',
    '.video-feed-item',
    '.tiktok-x6y88p-DivItemContainerV2',
    '.tiktok-yz6ijl-DivWrapper',
    '.video-item',
    'div[class*="DivItemContainer"]'
  ];
  
  let videoContainers = [];
  
  // Try each selector until we find elements
  for (const selector of videoContainerSelectors) {
    const elements = document.querySelectorAll(selector);
    if (elements && elements.length > 0) {
      videoContainers = Array.from(elements);
      console.log(`✅ ${elements.length} video containers found for view estimation`);
      break;
    }
  }
  
  if (videoContainers.length === 0) {
    console.log('❌ No video containers found for view estimation');
    return 0;
  }
  
  // Find view counts for each video
  let totalViews = 0;
  let recentVideosCount = 0;
  
  // We'll consider up to 10 most recent videos for estimation
  const maxVideosToCheck = Math.min(10, videoContainers.length);
  
  for (let i = 0; i < maxVideosToCheck; i++) {
    const container = videoContainers[i];
    
    // Try different selectors for view counts
    const viewSelectors = [
      '[data-e2e="video-views"]',
      '.video-count',
      '.view-count',
      'strong[class*="StrongVideoCount"]',
      'span[class*="SpanViewCount"]',
      'div[class*="DivPlayCount"]'
    ];
    
    let viewElement = null;
    
    for (const selector of viewSelectors) {
      try {
        const element = container.querySelector(selector);
        if (element) {
          viewElement = element;
          break;
        }
      } catch (err) {
        // Continue to next selector
      }
    }
    
    // If no view element found with selectors, try to find by text content
    if (!viewElement) {
      const allElements = container.querySelectorAll('span, div, strong');
      for (const element of allElements) {
        try {
          const text = element.textContent.trim();
          // Match patterns like "1.2M views", "1,2M vues", "1.2K", etc.
          if (/^\d+(\.\d+)?(K|M|B|k|m|b)?\s*(views|vues|visualizaciones)?$/.test(text)) {
            viewElement = element;
            break;
          }
        } catch (err) {
          // Continue to next element
        }
      }
    }
    
    if (viewElement) {
      const viewText = viewElement.textContent.trim();
      const views = parseNumericValue(viewText);
      
      if (views > 0) {
        totalViews += views;
        recentVideosCount++;
      }
    }
  }
  
  // If we found some videos with views
  if (recentVideosCount > 0) {
    // Calculate average views per video
    const avgViewsPerVideo = totalViews / recentVideosCount;
    
    // Estimate monthly views (assuming ~15 videos per month for active creators)
    const estimatedMonthlyViews = avgViewsPerVideo * 15;
    
    console.log(`Estimated monthly views: ${Math.round(estimatedMonthlyViews)}`);
    return estimatedMonthlyViews;
  }
  
  return 0;
}

/**
 * Check if a profile meets TikTok monetization eligibility requirements
 * @returns {Object} - Eligibility information
 */
function checkProfileEligibility() {
  console.log('Checking profile eligibility...');
  
  // Get follower count
  const followerCount = findFollowerCount();
  console.log(`Follower count: ${followerCount}`);
  
  // Estimate recent views (last 30 days)
  const recentViews = estimateRecentViews();
  console.log(`Estimated recent views: ${recentViews}`);
  
  // Check if meets requirements
  const hasEnoughFollowers = followerCount >= MINIMUM_FOLLOWERS;
  const hasEnoughViews = recentViews >= MINIMUM_RECENT_VIEWS;
  const isEligible = hasEnoughFollowers && hasEnoughViews;
  
  console.log(`Profile eligibility status: ${isEligible ? 'Eligible' : 'Not eligible'}`);
  console.log(`- Followers requirement (${MINIMUM_FOLLOWERS}): ${hasEnoughFollowers ? 'Met' : 'Not met'}`);
  console.log(`- Recent views requirement (${MINIMUM_RECENT_VIEWS}): ${hasEnoughViews ? 'Met' : 'Not met'}`);
  
  return {
    followerCount,
    recentViews,
    hasEnoughFollowers,
    hasEnoughViews,
    isEligible
  };
}

// Export functions
export {
  checkProfileEligibility,
  findFollowerCount,
  estimateRecentViews,
  parseNumericValue,
  MINIMUM_FOLLOWERS,
  MINIMUM_RECENT_VIEWS
};