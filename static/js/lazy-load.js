/**
 * Lazy loading for background images and other elements
 * Uses Intersection Observer API for efficient lazy loading
 */

(function() {
  'use strict';

  // Lazy load background images
  function lazyLoadBackgroundImages() {
    const elements = document.querySelectorAll('[data-bg-image]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target;
            const bgImage = element.getAttribute('data-bg-image');
            if (bgImage) {
              element.style.backgroundImage = `url(${bgImage})`;
              element.removeAttribute('data-bg-image');
              imageObserver.unobserve(element);
            }
          }
        });
      }, {
        rootMargin: '50px' // Start loading 50px before element enters viewport
      });

      elements.forEach(element => imageObserver.observe(element));
    } else {
      // Fallback for browsers without IntersectionObserver
      elements.forEach(element => {
        const bgImage = element.getAttribute('data-bg-image');
        if (bgImage) {
          element.style.backgroundImage = `url(${bgImage})`;
        }
      });
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', lazyLoadBackgroundImages);
  } else {
    lazyLoadBackgroundImages();
  }
})();

