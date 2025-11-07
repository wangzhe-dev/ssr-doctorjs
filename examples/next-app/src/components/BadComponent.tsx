'use client';

import { useEffect, useState } from 'react';

/**
 * This component contains multiple SSR compatibility issues
 * that should be detected by SSR Doctor
 */
export function BadComponent() {
  const [data, setData] = useState<string>('');

  // ❌ Issue 1: Direct window usage
  const windowWidth = window.innerWidth;

  // ❌ Issue 2: Direct document usage
  const title = document.title;

  // ❌ Issue 3: Direct localStorage usage
  const savedTheme = localStorage.getItem('theme');

  useEffect(() => {
    // ❌ Issue 4: Direct window usage in effect (still problematic during SSR)
    const handleResize = () => {
      console.log(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    // ❌ Issue 5: Direct sessionStorage usage
    const sessionData = sessionStorage.getItem('data');
    setData(sessionData || 'no data');

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // ❌ Issue 6: Direct navigator usage
  const userAgent = navigator.userAgent;

  return (
    <div>
      <p>Window Width: {windowWidth}</p>
      <p>Document Title: {title}</p>
      <p>Saved Theme: {savedTheme}</p>
      <p>Session Data: {data}</p>
      <p>User Agent: {userAgent}</p>
    </div>
  );
}
