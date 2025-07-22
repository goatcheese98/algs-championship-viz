/**
 * Unified Tooltip System for ALGS Championship Visualization
 * 
 * Provides consistent tooltip functionality across all components with:
 * - Unified styling and positioning
 * - Performance optimizations (debouncing, cleanup)
 * - Maximum z-index for visibility
 * - Viewport boundary checking
 * - Smooth animations
 */

class TooltipManager {
  constructor() {
    this.activeTooltips = new Map();
    this.debounceTimeout = null;
    this.DEBOUNCE_DELAY = 150; // ms
    this.Z_INDEX = 99999; // Topmost layer
  }

  /**
   * Create or get existing tooltip element
   * @param {string} id - Unique identifier for tooltip
   * @returns {HTMLElement} Tooltip element
   */
  createTooltip(id) {
    // Remove existing tooltip if it exists
    if (this.activeTooltips.has(id)) {
      this.destroyTooltip(id);
    }

    const tooltip = document.createElement('div');
    tooltip.className = 'unified-tooltip';
    tooltip.id = `tooltip-${id}`;
    
    // Apply unified styling
    tooltip.style.cssText = `
      position: fixed;
      visibility: hidden;
      opacity: 0;
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(30, 41, 59, 0.96) 100%);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(239, 68, 68, 0.4);
      border-radius: 8px;
      padding: 12px 16px;
      box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.4),
        0 0 16px rgba(239, 68, 68, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      color: #f1f5f9;
      font-family: Inter, system-ui, -apple-system, sans-serif;
      font-size: 13px;
      font-weight: 500;
      line-height: 1.4;
      pointer-events: none;
      z-index: ${this.Z_INDEX};
      max-width: 280px;
      min-width: 180px;
      text-align: left;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      transform: translateY(4px);
      will-change: transform, opacity;
    `;

    document.body.appendChild(tooltip);
    this.activeTooltips.set(id, tooltip);
    
    return tooltip;
  }

  /**
   * Show tooltip with content and positioning
   * @param {string} id - Tooltip identifier
   * @param {MouseEvent} event - Mouse event for positioning
   * @param {Object} options - Content and positioning options
   */
  showTooltip(id, event, options = {}) {
    const {
      title = '',
      content = '',
      html = '',
      offset = { x: 15, y: -10 },
      debounce = true,
      position = 'auto' // 'auto', 'right', 'left', 'above', 'below'
    } = options;

    const showTooltipImmediate = () => {
      const tooltip = this.createTooltip(id);
      
      // Set content
      if (html) {
        tooltip.innerHTML = html;
      } else {
        tooltip.innerHTML = this.generateTooltipHTML(title, content);
      }

      // Position tooltip
      this.positionTooltip(tooltip, event, offset, position);

      // Show with animation
      requestAnimationFrame(() => {
        tooltip.style.visibility = 'visible';
        tooltip.style.opacity = '1';
        tooltip.style.transform = 'translateY(0)';
      });
    };

    if (debounce) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(showTooltipImmediate, this.DEBOUNCE_DELAY);
    } else {
      showTooltipImmediate();
    }
  }

  /**
   * Update tooltip position on mouse move
   * @param {string} id - Tooltip identifier
   * @param {MouseEvent} event - Mouse event
   * @param {Object} offset - Position offset
   * @param {string} position - Positioning strategy
   */
  updateTooltipPosition(id, event, offset = { x: 15, y: -10 }, position = 'auto') {
    const tooltip = this.activeTooltips.get(id);
    if (!tooltip || tooltip.style.visibility === 'hidden') return;

    this.positionTooltip(tooltip, event, offset, position);
  }

  /**
   * Hide tooltip with animation
   * @param {string} id - Tooltip identifier
   */
  hideTooltip(id) {
    clearTimeout(this.debounceTimeout);
    
    const tooltip = this.activeTooltips.get(id);
    if (!tooltip) return;

    tooltip.style.opacity = '0';
    tooltip.style.transform = 'translateY(4px)';
    
    // Remove after animation
    setTimeout(() => {
      tooltip.style.visibility = 'hidden';
    }, 200);
  }

  /**
   * Destroy tooltip and remove from DOM
   * @param {string} id - Tooltip identifier
   */
  destroyTooltip(id) {
    const tooltip = this.activeTooltips.get(id);
    if (tooltip && tooltip.parentNode) {
      tooltip.parentNode.removeChild(tooltip);
    }
    this.activeTooltips.delete(id);
  }

  /**
   * Clean up all tooltips
   */
  destroyAll() {
    clearTimeout(this.debounceTimeout);
    
    for (const [id, tooltip] of this.activeTooltips) {
      if (tooltip && tooltip.parentNode) {
        tooltip.parentNode.removeChild(tooltip);
      }
    }
    
    this.activeTooltips.clear();
  }

  /**
   * Position tooltip with intelligent viewport boundary checking and scroll compensation
   * @private
   */
  positionTooltip(tooltip, event, offset, position) {
    // Get mouse position relative to viewport
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    
    // Get scroll offsets to convert viewport coordinates to document coordinates
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    
    // Convert to document coordinates (absolute positioning)
    const absoluteMouseX = mouseX + scrollX;
    const absoluteMouseY = mouseY + scrollY;
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const documentWidth = document.documentElement.scrollWidth;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Get tooltip dimensions (may need to be visible briefly)
    const rect = tooltip.getBoundingClientRect();
    const tooltipWidth = rect.width || 220; // fallback
    const tooltipHeight = rect.height || 100; // fallback
    
    let left = absoluteMouseX + offset.x;
    let top = absoluteMouseY + offset.y;

    // Auto positioning logic
    if (position === 'auto') {
      // Check if tooltip would go off-screen horizontally (relative to viewport)
      if (mouseX + offset.x + tooltipWidth > viewportWidth - 10) {
        left = absoluteMouseX - tooltipWidth - Math.abs(offset.x);
        position = 'left';
      } else {
        position = 'right';
      }

      // Check if tooltip would go off-screen vertically (relative to viewport)
      if (mouseY + offset.y + tooltipHeight > viewportHeight - 10) {
        top = absoluteMouseY - tooltipHeight - Math.abs(offset.y);
      }
    } else if (position === 'above') {
      // Special handling for "above" positioning (for button tooltips)
      const buttonRect = event.target.getBoundingClientRect();
      // Convert button position to absolute coordinates
      left = (buttonRect.left + scrollX) + (buttonRect.width / 2) - (tooltipWidth / 2);
      top = (buttonRect.top + scrollY) + offset.y;
    }

    // Apply positioning constraints relative to document bounds
    left = Math.max(scrollX + 10, Math.min(left, scrollX + viewportWidth - tooltipWidth - 10));
    top = Math.max(scrollY + 10, Math.min(top, scrollY + viewportHeight - tooltipHeight - 10));
    
    // Ensure we don't position outside the document bounds
    left = Math.max(10, Math.min(left, documentWidth - tooltipWidth - 10));
    top = Math.max(10, Math.min(top, documentHeight - tooltipHeight - 10));

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  /**
   * Generate consistent tooltip HTML structure
   * @private
   */
  generateTooltipHTML(title, content) {
    if (!title && !content) return '';

    let html = '';

    if (title) {
      html += `
        <div style="
          font-weight: 600; 
          color: #ef4444; 
          font-size: 14px; 
          margin-bottom: ${content ? '8px' : '0'};
          text-shadow: 0 0 8px rgba(239, 68, 68, 0.3);
        ">
          ${title}
        </div>
      `;
    }

    if (content) {
      if (typeof content === 'string') {
        html += `
          <div style="
            color: #e2e8f0; 
            font-size: 13px; 
            line-height: 1.4;
          ">
            ${content}
          </div>
        `;
      } else if (Array.isArray(content)) {
        html += '<div style="display: grid; grid-template-columns: 1fr auto; gap: 8px 16px; font-size: 13px;">';
        content.forEach(item => {
          html += `
            <span style="color: #cbd5e1;">${item.label}:</span>
            <span style="color: #f1f5f9; font-weight: 600;">${item.value}</span>
          `;
        });
        html += '</div>';
      }
    }

    return html;
  }

  /**
   * Create map tooltip with image preview
   * @param {string} id - Tooltip identifier
   * @param {MouseEvent} event - Mouse event
   * @param {Object} mapData - Map information
   */
  showMapTooltip(id, event, mapData) {
    const { mapName, imageUrl, subtitle = '' } = mapData;

    const html = `
      <div style="text-align: center;">
        <div style="margin-bottom: 8px;">
          <div style="font-weight: 600; color: #ef4444; font-size: 14px; margin-bottom: 4px; text-shadow: 0 0 8px rgba(239, 68, 68, 0.3);">
            ${subtitle || 'Current Map'}
          </div>
          <div style="font-weight: 500; color: #f1f5f9; font-size: 13px;">
            ${mapName}
          </div>
        </div>
        ${imageUrl ? `
          <div style="border-radius: 6px; overflow: hidden; border: 1px solid rgba(239, 68, 68, 0.2);">
            <img src="${imageUrl}" 
                 alt="${mapName}" 
                 style="width: 100%; height: 80px; object-fit: cover; display: block;">
          </div>
        ` : ''}
      </div>
    `;

    this.showTooltip(id, event, {
      html,
      debounce: true,
      offset: { x: 15, y: 0 }
    });
  }

  /**
   * Create chart bar tooltip with game data
   * @param {string} id - Tooltip identifier  
   * @param {MouseEvent} event - Mouse event
   * @param {Object} gameData - Game data information
   */
  showChartTooltip(id, event, gameData) {
    const { 
      teamName, 
      gameNumber, 
      mapName, 
      placement, 
      kills, 
      points,
      teamColor = '#ef4444'
    } = gameData;

    const placementText = placement ? `${placement}${this.getOrdinalSuffix(placement)}` : 'N/A';

    const html = `
      <div style="border-bottom: 1px solid rgba(239, 68, 68, 0.3); padding-bottom: 8px; margin-bottom: 8px;">
        <div style="font-weight: 600; color: ${teamColor}; font-size: 14px; text-shadow: 0 0 8px ${teamColor}30;">
          ${teamName}
        </div>
        <div style="color: #10b981; font-size: 12px; margin-top: 2px;">
          Game ${gameNumber}
        </div>
        ${mapName ? `
          <div style="color: #94a3b8; font-size: 12px; margin-top: 1px;">
            ${mapName}
          </div>
        ` : ''}
      </div>
      <div style="display: grid; grid-template-columns: 1fr auto; gap: 6px 16px; font-size: 13px;">
        <span style="color: #cbd5e1;">Placement:</span>
        <span style="color: #f1f5f9; font-weight: 600;">${placementText}</span>
        <span style="color: #cbd5e1;">Kills:</span>
        <span style="color: #f1f5f9; font-weight: 600;">${kills || 0}</span>
        <span style="color: #cbd5e1;">Points:</span>
        <span style="color: #f1f5f9; font-weight: 600;">${points || 0}</span>
      </div>
    `;

    this.showTooltip(id, event, {
      html,
      debounce: false,
      offset: { x: 15, y: -10 }
    });
  }

  /**
   * Get ordinal suffix for placement numbers
   * @private
   */
  getOrdinalSuffix(num) {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  }
}

// Create and export singleton instance
export const tooltipManager = new TooltipManager();

// Export class for custom instances if needed
export default TooltipManager;