/**
 * Badge module for TokMoney
 * Creates and manages earnings badges on TikTok videos
 */

import { calculateEarnings, formatCurrency } from './earnings.js';
import { parseNumericValue } from './eligibility.js';

/**
 * Check if a container contains a video (vs. an image)
 * @param {Element} container - Container element to check
 * @returns {boolean} - True if container has a video
 */
function isVideo(container) {
  // Check for source element with type="image/avif"
  const sourceElement = container.querySelector('source[type="image/avif"]');
  return !!sourceElement;
}

/**
 * Create and add earnings badge to a video container
 * @param {Element} container - Container to add badge to
 * @param {number} views - View count
 * @param {boolean} isVideoContent - Whether this is a video (vs image)
 * @param {boolean} showLoadingFirst - Whether to show loading animation first
 * @returns {Element} - Created badge element
 */
function addEarningsBadge(container, views, isVideoContent, showLoadingFirst = false) {
  // Remove any existing badge first
  const existingBadge = container.querySelector('.tokmoney-badge');
  if (existingBadge) {
    existingBadge.remove();
  }
  
  // Create badge element
  const badge = document.createElement('div');
  badge.className = 'tokmoney-badge';
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
    spinner.className = 'tokmoney-spinner';
    spinner.style.width = '14px';
    spinner.style.height = '14px';
    spinner.style.border = '2px solid rgba(255, 255, 255, 0.3)';
    spinner.style.borderRadius = '50%';
    spinner.style.borderTop = '2px solid white';
    spinner.style.animation = 'tokmoney-spin 0.8s linear infinite';
    
    // Add spinner animation
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes tokmoney-spin {
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

/**
 * Update badge with actual earnings value
 * @param {Element} badge - Badge element to update
 * @param {number} views - View count
 * @param {boolean} isVideoContent - Whether this is a video (vs image)
 */
function updateBadgeWithValue(badge, views, isVideoContent) {
  // Remove any existing spinner
  const spinner = badge.querySelector('.tokmoney-spinner');
  if (spinner) {
    spinner.remove();
  }
  
  if (isVideoContent) {
    // Calculate earnings for videos
    const earnings = calculateEarnings(views);
    
    badge.style.backgroundColor = 'rgba(0, 182, 122, 0.85)'; // #00B67A with opacity
    badge.style.color = 'white';
    badge.textContent = formatCurrency(earnings);
    badge.title = `Estimated earnings for ${views.toLocaleString()} views\n${Math.round(views * 0.4).toLocaleString()} eligible views (about 40%)\nBased on current RPM settings`;
  } else {
    // For non-eligible content, show 0€
    badge.style.backgroundColor = 'rgba(254, 44, 85, 0.85)';
    badge.style.color = 'white';
    badge.textContent = '0€';
    badge.title = 'Content not eligible for revenue';
  }
}

/**
 * Find view count in a video container
 * @param {Element} container - Container to search in
 * @returns {number} - View count or 0 if not found
 */
function findViewCount(container) {
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
  
  if (!viewElement) {
    return 0;
  }
  
  const viewText = viewElement.textContent.trim();
  return parseNumericValue(viewText);
}

// Export functions
export {
  addEarningsBadge,
  updateBadgeWithValue,
  isVideo,
  findViewCount
};