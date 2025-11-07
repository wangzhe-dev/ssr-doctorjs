'use client';

// This component uses browser APIs
export default function ClientOnlyWidget() {
  const width = window.innerWidth;
  return <div>Window width: {width}</div>;
}
