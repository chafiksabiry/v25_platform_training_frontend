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

/**
 * Get user type from cookies or token
 * Returns 'trainer' (company) or 'rep' (trainee)
 */
export const getUserType = (): 'trainer' | 'rep' | null => {
  try {
    // Check cookies first
    const companyId = Cookies.get('companyId');
    const repId = Cookies.get('repId') || Cookies.get('agentId');
    
    if (companyId) {
      return 'trainer';
    }
    
    if (repId) {
      return 'rep';
    }
    
    // Fallback to token if available
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    if (token) {
      const userInfo = decodeToken(token);
      if (userInfo) {
        // Check typeUser field from token
        if (userInfo.typeUser === 'company') {
          return 'trainer';
        }
        if (userInfo.typeUser === 'rep') {
          return 'rep';
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('[UserUtils] Error getting user type:', error);
    return null;
  }
};

/**
 * Get company ID from cookies or token
 */
export const getCompanyId = (): string | null => {
  try {
    const companyId = Cookies.get('companyId');
    if (companyId) {
      return companyId;
    }
    
    // Fallback to token if available
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    if (token) {
      const userInfo = decodeToken(token);
      if (userInfo && userInfo.typeUser === 'company') {
        return userInfo._id || userInfo.id || null;
      }
    }
    
    return null;
  } catch (error) {
    console.error('[UserUtils] Error getting company ID:', error);
    return null;
  }
};

/**
 * Get rep ID from cookies or token
 */
export const getRepId = (): string | null => {
  try {
    const repId = Cookies.get('repId') || Cookies.get('agentId');
    if (repId) {
      return repId;
    }
    
    // Fallback to token if available
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    if (token) {
      const userInfo = decodeToken(token);
      if (userInfo && userInfo.typeUser === 'rep') {
        return userInfo._id || userInfo.id || null;
      }
    }
    
    return null;
  } catch (error) {
    console.error('[UserUtils] Error getting rep ID:', error);
    return null;
  }
};

