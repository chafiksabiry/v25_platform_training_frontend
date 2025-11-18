import Cookies from 'js-cookie';

/**
 * Decode JWT token to get user information
 */
export const decodeToken = (token: string) => {
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
    console.error('[UserUtils] Error decoding token:', error);
    return null;
  }
};

/**
 * Get current user name from token or cookies
 */
export const getCurrentUserName = (): string => {
  try {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    if (token) {
      const userInfo = decodeToken(token);
      if (userInfo) {
        return userInfo.fullName || userInfo.name || userInfo.email || 'User';
      }
    }
    
    // Fallback to cookie if available
    const userName = Cookies.get('userName');
    if (userName) {
      return userName;
    }
    
    return 'User';
  } catch (error) {
    console.error('[UserUtils] Error getting user name:', error);
    return 'User';
  }
};

/**
 * Get current user email from token
 */
export const getCurrentUserEmail = (): string => {
  try {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    if (token) {
      const userInfo = decodeToken(token);
      if (userInfo) {
        return userInfo.email || '';
      }
    }
    return '';
  } catch (error) {
    console.error('[UserUtils] Error getting user email:', error);
    return '';
  }
};

