/* =============================================================================
   ALGS CHAMPIONSHIP VISUALIZATION - VISUAL ENHANCER COMPOSABLE
   Vue 3 composable for integrating visual enhancements
   ============================================================================= */

import { onMounted, onUnmounted, ref } from 'vue';
import { visualEnhancer } from '../utils/visualEnhancer.js';

export function useVisualEnhancer() {
  const isEnhanced = ref(false);
  const observers = ref([]);

  // Add entrance animation to element
  const addEntranceAnimation = (selector, animationClass = 'fade-in-up') => {
    onMounted(() => {
      setTimeout(() => {
        visualEnhancer.observeForAnimations(selector, animationClass);
      }, 100);
    });
  };

  // Add staggered animation to container
  const addStaggeredAnimation = (containerSelector) => {
    onMounted(() => {
      setTimeout(() => {
        visualEnhancer.applyStaggeredAnimation(containerSelector);
      }, 150);
    });
  };

  // Add hover enhancement to elements
  const addHoverEnhancement = (selector) => {
    onMounted(() => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.classList.add('enhanced-hover');
      });
    });
  };

  // Add loading state management
  const createLoadingState = () => {
    const isLoading = ref(false);
    
    const setLoading = (loading, element = null) => {
      isLoading.value = loading;
      if (element) {
        if (loading) {
          element.classList.add('btn-loading');
        } else {
          element.classList.remove('btn-loading');
        }
      }
    };

    return { isLoading, setLoading };
  };

  // Add professional focus management
  const addFocusEnhancement = (selector) => {
    onMounted(() => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.addEventListener('focus', () => el.classList.add('focus-ring'));
        el.addEventListener('blur', () => el.classList.remove('focus-ring'));
      });
    });
  };

  // Add shimmer loading effect
  const addShimmerLoading = (selector, duration = 2000) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.classList.add('loading-shimmer');
      setTimeout(() => {
        el.classList.remove('loading-shimmer');
      }, duration);
    });
  };

  // Add pulse glow effect
  const addPulseGlow = (selector, temporary = false, duration = 5000) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.classList.add('pulse-glow');
      if (temporary) {
        setTimeout(() => {
          el.classList.remove('pulse-glow');
        }, duration);
      }
    });
  };

  // Progressive image loading with blur effect
  const addProgressiveImageLoading = (selector) => {
    onMounted(() => {
      const images = document.querySelectorAll(selector);
      images.forEach(img => {
        if (img.complete) return;
        
        // Add blur while loading
        img.style.filter = 'blur(5px)';
        img.style.transition = 'filter 0.3s ease';
        
        img.addEventListener('load', () => {
          img.style.filter = 'none';
        });
      });
    });
  };

  // Cleanup observers
  onUnmounted(() => {
    observers.value.forEach(observer => {
      if (observer && observer.disconnect) {
        observer.disconnect();
      }
    });
  });

  return {
    isEnhanced,
    addEntranceAnimation,
    addStaggeredAnimation,
    addHoverEnhancement,
    createLoadingState,
    addFocusEnhancement,
    addShimmerLoading,
    addPulseGlow,
    addProgressiveImageLoading,
    visualEnhancer
  };
}