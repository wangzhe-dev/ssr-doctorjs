'use client';

import { useEffect, useState } from 'react';

/**
 * This component properly handles SSR compatibility
 * by checking for browser environment before using browser APIs
 */
export function GoodComponent() {
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const [title, setTitle] = useState<string>('');
  const [savedTheme, setSavedTheme] = useState<string>('');
  const [sessionData, setSessionData] = useState<string>('');
  const [userAgent, setUserAgent] = useState<string>('');

  useEffect(() => {
    // ✅ Good: Check for window before using it
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);

      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };

      window.addEventListener('resize', handleResize);

      // ✅ Good: Check before using localStorage
      const theme = localStorage.getItem('theme');
      setSavedTheme(theme || 'default');

      // ✅ Good: Check before using sessionStorage
      const session = sessionStorage.getItem('data');
      setSessionData(session || 'no data');

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  useEffect(() => {
    // ✅ Good: Check for document before using it
    if (typeof document !== 'undefined') {
      setTitle(document.title);
    }

    // ✅ Good: Check for navigator before using it
    if (typeof navigator !== 'undefined') {
      setUserAgent(navigator.userAgent);
    }
  }, []);

  return (
    <div>
      <p>Window Width: {windowWidth || 'Loading...'}</p>
      <p>Document Title: {title || 'Loading...'}</p>
      <p>Saved Theme: {savedTheme || 'Loading...'}</p>
      <p>Session Data: {sessionData || 'Loading...'}</p>
      <p>User Agent: {userAgent || 'Loading...'}</p>
    </div>
  );
}
