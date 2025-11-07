/**
 * This file contains intentional violations of SSR Doctor rules
 * for testing and demonstration purposes
 */

// ❌ Violation: hydration-risk-useeffect
// Browser API used during render without useEffect
export function HydrationRiskExample() {
  // This will cause hydration mismatch!
  const width = window.innerWidth;
  const isWide = width > 768;

  return (
    <div>
      <h3>Screen size: {isWide ? 'Wide' : 'Narrow'}</h3>
      <p>Width: {width}px</p>
    </div>
  );
}

// ❌ Violation: no-browser-api-in-ssr (if in app directory without 'use client')
// Direct browser API usage in SSR context
export function BrowserAPIViolation() {
  const userAgent = navigator.userAgent;
  const currentURL = window.location.href;
  const pageTitle = document.title;
  const storedValue = localStorage.getItem('user');

  return (
    <div>
      <p>User Agent: {userAgent}</p>
      <p>Current URL: {currentURL}</p>
      <p>Page Title: {pageTitle}</p>
      <p>Stored Value: {storedValue}</p>
    </div>
  );
}

// ❌ Violation: multiple browser APIs without guards
export function MultipleBrowserAPIs() {
  const scrollY = window.scrollY;
  const cookieEnabled = navigator.cookieEnabled;
  const referrer = document.referrer;
  const sessionData = sessionStorage.getItem('session');

  return (
    <div>
      <p>Scroll Position: {scrollY}</p>
      <p>Cookies Enabled: {cookieEnabled ? 'Yes' : 'No'}</p>
      <p>Referrer: {referrer}</p>
      <p>Session: {sessionData}</p>
    </div>
  );
}

// ❌ Violation: Browser API in conditional rendering
export function ConditionalBrowserAPI() {
  // This will cause hydration mismatch
  const isMobile = window.innerWidth < 768;

  return (
    <div>
      {isMobile ? (
        <p>Mobile View</p>
      ) : (
        <p>Desktop View</p>
      )}
    </div>
  );
}

// ✅ Good: Using typeof guard (should not trigger errors)
export function SafeBrowserAPI() {
  const width =
    typeof window !== 'undefined' ? window.innerWidth : 0;

  return (
    <div>
      <p>Width: {width}px</p>
    </div>
  );
}
