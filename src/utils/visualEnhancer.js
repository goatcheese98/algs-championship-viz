/* =============================================================================
   ALGS CHAMPIONSHIP VISUALIZATION - VISUAL ENHANCER
   Progressive enhancement system for professional visual elements
   ============================================================================= */

class VisualEnhancer {
  constructor() {
    this.enhancementsLoaded = new Set();
    this.observers = new Map();
    this.animationQueue = [];
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    // Load enhancements progressively after initial render
    await this.scheduleEnhancements();
    this.isInitialized = true;
  }

  async scheduleEnhancements() {
    // Phase 1: Essential visual polish (300ms delay)
    setTimeout(() => this.loadEssentialPolish(), 300);
    
    // Phase 2: Interactive enhancements (800ms delay) 
    setTimeout(() => this.loadInteractiveEnhancements(), 800);
    
    // Phase 3: Advanced animations (1500ms delay)
    setTimeout(() => this.loadAdvancedAnimations(), 1500);
    
    // Phase 4: Micro-interactions (2500ms delay)
    setTimeout(() => this.loadMicroInteractions(), 2500);
  }

  async loadEssentialPolish() {
    if (this.enhancementsLoaded.has('essential')) return;

    const essentialCSS = `
      /* Professional visual polish */
      .main-layout {
        background: linear-gradient(135deg, 
          var(--color-bg-primary) 0%, 
          rgba(30, 15, 15, 0.98) 100%);
        backdrop-filter: blur(20px);
      }

      .tournament-card {
        transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .tournament-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(239, 68, 68, 0.2);
      }

      .algs-header {
        backdrop-filter: blur(10px);
        border-bottom: 1px solid rgba(239, 68, 68, 0.1);
      }

      /* Professional button styling */
      .btn-filter {
        position: relative;
        overflow: hidden;
        background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
        border: none;
        transition: all 0.2s ease;
      }

      .btn-filter::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        transition: left 0.5s;
      }

      .btn-filter:hover::before {
        left: 100%;
      }
    `;

    this.injectCSS('essential-polish', essentialCSS);
    this.enhancementsLoaded.add('essential');
    console.log('✨ Essential visual polish loaded');
  }

  async loadInteractiveEnhancements() {
    if (this.enhancementsLoaded.has('interactive')) return;

    const interactiveCSS = `
      /* Advanced hover states */
      .chart-container {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .team-entry {
        transition: background-color 0.2s ease, transform 0.1s ease;
        cursor: pointer;
      }

      .team-entry:hover {
        background: rgba(239, 68, 68, 0.05);
        transform: translateX(2px);
      }

      /* Professional focus states */
      button:focus-visible,
      input:focus-visible,
      select:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
      }

      /* Loading states */
      .loading-shimmer {
        background: linear-gradient(
          90deg,
          rgba(255, 255, 255, 0.1) 0%,
          rgba(255, 255, 255, 0.2) 50%,
          rgba(255, 255, 255, 0.1) 100%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }

      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }

      /* Enhanced tooltips */
      .tooltip {
        position: relative;
        background: rgba(0, 0, 0, 0.9);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(239, 68, 68, 0.2);
        border-radius: 8px;
        padding: 8px 12px;
        font-size: 14px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        animation: tooltipFadeIn 0.2s ease-out;
      }

      @keyframes tooltipFadeIn {
        from { opacity: 0; transform: translateY(5px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;

    this.injectCSS('interactive-enhancements', interactiveCSS);
    this.enhancementsLoaded.add('interactive');
    console.log('🎯 Interactive enhancements loaded');
  }

  async loadAdvancedAnimations() {
    if (this.enhancementsLoaded.has('animations')) return;

    const animationCSS = `
      /* Professional entrance animations */
      .fade-in-up {
        animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) both;
      }

      .fade-in-left {
        animation: fadeInLeft 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
      }

      .stagger-children > * {
        animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
      }

      .stagger-children > *:nth-child(1) { animation-delay: 0.1s; }
      .stagger-children > *:nth-child(2) { animation-delay: 0.2s; }
      .stagger-children > *:nth-child(3) { animation-delay: 0.3s; }
      .stagger-children > *:nth-child(4) { animation-delay: 0.4s; }
      .stagger-children > *:nth-child(5) { animation-delay: 0.5s; }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes fadeInLeft {
        from {
          opacity: 0;
          transform: translateX(-30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      /* Chart animations */
      .chart-bar {
        animation: chartBarGrow 0.8s cubic-bezier(0.4, 0, 0.2, 1) both;
      }

      @keyframes chartBarGrow {
        from {
          transform: scaleY(0);
          transform-origin: bottom;
        }
        to {
          transform: scaleY(1);
          transform-origin: bottom;
        }
      }

      /* Professional pulse effect for important elements */
      .pulse-glow {
        animation: pulseGlow 2s infinite;
      }

      @keyframes pulseGlow {
        0%, 100% {
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
        }
        50% {
          box-shadow: 0 0 30px rgba(239, 68, 68, 0.5);
        }
      }
    `;

    this.injectCSS('advanced-animations', animationCSS);
    this.enhancementsLoaded.add('animations');
    console.log('🎬 Advanced animations loaded');
  }

  async loadMicroInteractions() {
    if (this.enhancementsLoaded.has('micro-interactions')) return;

    const microInteractionCSS = `
      /* Subtle micro-interactions for professional feel */
      .action-panel button {
        transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .action-panel button:active {
        transform: scale(0.98);
      }

      .map-badge {
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .map-badge:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
      }

      /* Professional scroll indicators */
      .scroll-indicator {
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(to right, var(--color-primary), var(--color-accent));
        transform-origin: left;
        z-index: 1000;
        transition: transform 0.1s ease-out;
      }

      /* Enhanced selection states */
      ::selection {
        background: rgba(239, 68, 68, 0.3);
        color: white;
      }

      /* Professional loading states */
      .btn-loading {
        position: relative;
        pointer-events: none;
      }

      .btn-loading::after {
        content: '';
        position: absolute;
        width: 16px;
        height: 16px;
        top: 50%;
        left: 50%;
        margin-left: -8px;
        margin-top: -8px;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      /* Smooth scrolling */
      html {
        scroll-behavior: smooth;
      }

      /* Professional focus indicators */
      .focus-ring {
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.3);
        transition: box-shadow 0.15s ease-in-out;
      }
    `;

    this.injectCSS('micro-interactions', microInteractionCSS);
    this.enhancementsLoaded.add('micro-interactions');
    
    // Add scroll progress indicator
    this.addScrollProgressIndicator();
    
    console.log('⚡ Micro-interactions loaded');
  }

  addScrollProgressIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'scroll-indicator';
    indicator.style.width = '0%';
    document.body.appendChild(indicator);

    const updateScrollProgress = () => {
      const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      indicator.style.transform = `scaleX(${scrolled / 100})`;
    };

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
  }

  injectCSS(id, cssText) {
    // Remove existing stylesheet if present
    const existing = document.getElementById(id);
    if (existing) {
      existing.remove();
    }

    // Create and inject new stylesheet
    const style = document.createElement('style');
    style.id = id;
    style.textContent = cssText;
    document.head.appendChild(style);
  }

  // Apply entrance animations to elements as they come into view
  observeForAnimations(selector, animationClass = 'fade-in-up') {
    if (!window.IntersectionObserver) return;

    const elements = document.querySelectorAll(selector);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(animationClass);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });

    elements.forEach(el => observer.observe(el));
    this.observers.set(selector, observer);
  }

  // Apply staggered animations to container children
  applyStaggeredAnimation(containerSelector) {
    const containers = document.querySelectorAll(containerSelector);
    containers.forEach(container => {
      container.classList.add('stagger-children');
    });
  }

  getStats() {
    return {
      enhancementsLoaded: Array.from(this.enhancementsLoaded),
      observersActive: this.observers.size,
      isInitialized: this.isInitialized
    };
  }
}

// Create global instance
const visualEnhancer = new VisualEnhancer();

export { visualEnhancer, VisualEnhancer };