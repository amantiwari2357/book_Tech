// Performance monitoring utility
export const performanceMonitor = {
  // Track Largest Contentful Paint (LCP)
  trackLCP: () => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
        
        // Send to analytics if needed
        if (window.gtag) {
          window.gtag('event', 'LCP', {
            value: Math.round(lastEntry.startTime),
            event_category: 'Web Vitals',
          });
        }
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  },

  // Track First Input Delay (FID)
  trackFID: () => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          console.log('FID:', entry.processingStart - entry.startTime);
          
          if (window.gtag) {
            window.gtag('event', 'FID', {
              value: Math.round(entry.processingStart - entry.startTime),
              event_category: 'Web Vitals',
            });
          }
        });
      });
      
      observer.observe({ entryTypes: ['first-input'] });
    }
  },

  // Track Cumulative Layout Shift (CLS)
  trackCLS: () => {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      let clsEntries: any[] = [];
      
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += (entry as any).value;
            clsEntries.push(entry);
          }
        }
        
        console.log('CLS:', clsValue);
        
        if (window.gtag) {
          window.gtag('event', 'CLS', {
            value: Math.round(clsValue * 1000) / 1000,
            event_category: 'Web Vitals',
          });
        }
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
    }
  },

  // Track First Contentful Paint (FCP)
  trackFCP: () => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const firstEntry = entries[0];
        console.log('FCP:', firstEntry.startTime);
        
        if (window.gtag) {
          window.gtag('event', 'FCP', {
            value: Math.round(firstEntry.startTime),
            event_category: 'Web Vitals',
          });
        }
      });
      
      observer.observe({ entryTypes: ['first-contentful-paint'] });
    }
  },

  // Initialize all performance tracking
  init: () => {
    performanceMonitor.trackLCP();
    performanceMonitor.trackFID();
    performanceMonitor.trackCLS();
    performanceMonitor.trackFCP();
  },
};

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default performanceMonitor; 