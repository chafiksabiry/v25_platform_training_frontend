import React from 'react';
import './public-path';  // For proper Qiankun integration
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';

console.log('[Training] main.tsx is being executed');

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import './index.css';
import Cookies from 'js-cookie';

// Function to decode JWT token
const decodeToken = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('[Training] Error decoding token:', error);
    return null;
  }
};

const userId = Cookies.get('userId');
const token = localStorage.getItem('token');

// Set default companyId if not present (for testing)
let companyId = Cookies.get('companyId');
if (!companyId) {
  companyId = '68cab073cfa9381f0ed56393'; // Default company ID
  Cookies.set('companyId', companyId, { expires: 365 });
  console.log('[Training] Set default companyId in cookie:', companyId);
}

console.log('[Training] Stored userId from cookie:', userId);
console.log('[Training] Stored companyId from cookie:', companyId);
console.log('[Training] Stored token from localStorage:', token);

// Check authentication - redirect if not logged in (check both userId and token)
if (!token || !userId){
  console.log('[Training] Authentication failed - userId:', userId, 'token:', token ? 'Present' : 'Not found');
  console.log('[Training] Redirecting to login page');
  
  // Redirect to main app login page
  if (window.location.hostname === 'training.harx.ai') {
    // If accessed directly via training.harx.ai, redirect to main app
    window.location.href = 'https://v25.harx.ai/app1';
  } else {
    // If accessed via v25.harx.ai (Qiankun), redirect to app1
    window.location.href = '/app1';
  }
} else {
  // Decode token and get user info
  const userInfo = decodeToken(token);
  console.log('[Training] Decoded user info from token:', userInfo);
  
  if (userInfo) {
    console.log('[Training] User ID:', userInfo.userId || userInfo.id || userInfo.sub);
    console.log('[Training] User email:', userInfo.email);
    console.log('[Training] User name:', userInfo.name || userInfo.fullName);
    console.log('[Training] Token expiry:', userInfo.exp ? new Date(userInfo.exp * 1000) : 'Not available');
    
    // Check if token is expired
    if (userInfo.exp && userInfo.exp * 1000 < Date.now()) {
      console.warn('[Training] Token is expired, redirecting to /app1');
      localStorage.removeItem('token');
      Cookies.remove('userId');
      window.location.href = '/app1';
    }
  }
}

// Store the root instance for proper unmounting
let root: ReturnType<typeof createRoot> | null = null;

function render(props: { container?: HTMLElement }) {
  const { container } = props;
  console.log('[Training] Render function called with props:', props);
  console.log('[Training] Container provided:', container);
  
  const rootElement = container
    ? container.querySelector('#root')
    : document.getElementById('root');

  if (rootElement) {
    console.log('[Training] Rendering in container:', rootElement);
    // Create the root instance if it doesn't exist
    if (!root) {
      console.log('[Training] Creating new root instance');
      root = createRoot(rootElement);
    }
    console.log('[Training] Rendering App component');
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>
    );
    console.log('[Training] App component rendered');
  } else {
    console.warn('[Training] Root element not found!');
    console.log('[Training] Document body:', document.body.innerHTML);
  }
}

export async function bootstrap() {
  console.time('[Training] bootstrap');
  console.log('[Training] Bootstrapping...');
  
  try {
    // Immediate resolution to avoid timeouts
    console.log('[Training] Bootstrap completed successfully');
    console.timeEnd('[Training] bootstrap');
  } catch (error) {
    console.error('[Training] Bootstrap failed:', error);
    console.timeEnd('[Training] bootstrap');
    throw error;
  }
}

export async function mount(props: any) {
  console.log('[Training] Mounting...', props);
  const { container } = props;
  if (container) {
    console.log('[Training] Found container for mounting:', container);
  } else {
    console.warn('[Training] No container found for mounting');
  }
  render(props);
  return Promise.resolve();
}

export async function unmount(props: any) {
  console.log('[Training] Unmounting...', props);
  const { container } = props;
  const rootElement = container
    ? container.querySelector('#root')
    : document.getElementById('root');

  if (rootElement && root) {
    console.log('[Training] Unmounting from container:', rootElement);
    root.unmount();
    root = null;  // Reset the root instance
  } else {
    console.warn('[Training] Root element not found for unmounting!');
  }
  return Promise.resolve();
}

// Add error handling for module loading
window.addEventListener('error', (event) => {
  console.error('[Training] Error loading module:', event);
});

// Standalone mode: If the app is running outside Qiankun, it will use this code
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  console.log('[Training] Running in standalone mode');
  console.log('[Training] Document ready state:', document.readyState);
  
  // Wait for the DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('[Training] DOM content loaded, rendering app');
      render({});
    });
  } else {
    console.log('[Training] DOM already loaded, rendering app immediately');
    try {
      render({});
    } catch (error) {
      console.error('[Training] Error rendering app:', error);
    }
  }
} else {
  console.log('[Training] Running inside Qiankun');
  // Qiankun will control the lifecycle
  render({});
}
