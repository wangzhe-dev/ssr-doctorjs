/**
 * Example component with SSR violation:
 * Uses window.innerWidth without guard
 *
 * This should trigger:
 * - @ssr-doctor/no-browser-api-in-ssr (if in app/ directory without 'use client')
 * - @ssr-doctor/hydration-risk-useeffect (uses browser API during render)
 */

export function WidthDetector() {
  // ❌ VIOLATION: Direct window usage without guard
  const width = window.innerWidth;
  const isMobile = width < 768;

  return (
    <div>
      <h3>Screen Width Detector</h3>
      <p>Current width: {width}px</p>
      <p>Device type: {isMobile ? 'Mobile' : 'Desktop'}</p>
    </div>
  );
}
