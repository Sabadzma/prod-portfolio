import { useEffect } from 'react';

declare global {
  interface Window {
    clarity: any;
  }
}

export default function ClarityScript() {
  useEffect(() => {
    // Get the Clarity Project ID from environment variable
    const clarityId = import.meta.env.VITE_CLARITY_PROJECT_ID;
    
    if (!clarityId) {
      console.warn('Microsoft Clarity: Project ID not found in environment variables');
      return;
    }

    // Check if Clarity is already loaded
    if (window.clarity) {
      return;
    }

    // Microsoft Clarity tracking code - simplified version
    window.clarity = window.clarity || function(...args: any[]) {
      (window.clarity.q = window.clarity.q || []).push(args);
    };
    
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.clarity.ms/tag/${clarityId}`;
    
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    }

  }, []);

  return null;
}