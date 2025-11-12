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

const userId = Cookies.get('userId');
const token = localStorage.getItem('token');
console.log('[Training] Stored userId from cookie:', userId);
console.log('[Training] Stored token from localStorage:', token);

// Check authentication - redirect if not logged in (check both userId and token)
if (!token || !userId){
  console.log('[Training] Authentication failed - userId:', userId, 'token:', token ? 'Present' : 'Not found');
  console.log('[Training] Redirecting to /app1');
  window.location.href = '/app1';
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
