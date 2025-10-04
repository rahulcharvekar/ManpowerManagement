// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Login user
export async function loginUser(credentials) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
    throw new Error(errorData.message || `Login failed: ${response.statusText}`);
  }

  return response.json();
}

// Register new user
export async function registerUser(userData) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
    throw new Error(errorData.message || `Registration failed: ${response.statusText}`);
  }

  return response.json();
}

// Send password reset email
export async function sendPasswordResetEmail(email) {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to send reset email' }));
    throw new Error(errorData.message || `Failed to send reset email: ${response.statusText}`);
  }

  return response.json();
}

// Verify password reset code
export async function verifyPasswordResetCode(email, code) {
  const response = await fetch(`${API_BASE_URL}/auth/verify-reset-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ email, code }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Invalid verification code' }));
    throw new Error(errorData.message || `Code verification failed: ${response.statusText}`);
  }

  return response.json();
}

// Reset password with new password
export async function resetPassword(email, code, newPassword) {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ 
      email, 
      code, 
      newPassword 
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Password reset failed' }));
    throw new Error(errorData.message || `Password reset failed: ${response.statusText}`);
  }

  return response.json();
}

// Refresh authentication token
export async function refreshToken(refreshToken) {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Token refresh failed' }));
    throw new Error(errorData.message || `Token refresh failed: ${response.statusText}`);
  }

  return response.json();
}

// Logout user
export async function logoutUser(token) {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Logout failed' }));
    throw new Error(errorData.message || `Logout failed: ${response.statusText}`);
  }

  return response.json();
}

// Get current user profile
export async function getCurrentUser(token) {
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch profile' }));
    throw new Error(errorData.message || `Profile fetch failed: ${response.statusText}`);
  }

  return response.json();
}

// Update user profile
export async function updateUserProfile(token, userData) {
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Profile update failed' }));
    throw new Error(errorData.message || `Profile update failed: ${response.statusText}`);
  }

  return response.json();
}

// Change password (when logged in)
export async function changePassword(token, currentPassword, newPassword) {
  const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ 
      currentPassword, 
      newPassword 
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Password change failed' }));
    throw new Error(errorData.message || `Password change failed: ${response.statusText}`);
  }

  return response.json();
}

// Validate user session
export async function validateSession(token) {
  const response = await fetch(`${API_BASE_URL}/auth/validate`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Session validation failed' }));
    throw new Error(errorData.message || `Session validation failed: ${response.statusText}`);
  }

  return response.json();
}

// Utility functions for token management
export const TokenManager = {
  // Store token in localStorage
  setToken: (token) => {
    localStorage.setItem('authToken', token);
  },

  // Get token from localStorage
  getToken: () => {
    return localStorage.getItem('authToken');
  },

  // Remove token from localStorage
  removeToken: () => {
    localStorage.removeItem('authToken');
  },

  // Store refresh token in localStorage
  setRefreshToken: (refreshToken) => {
    localStorage.setItem('refreshToken', refreshToken);
  },

  // Get refresh token from localStorage
  getRefreshToken: () => {
    return localStorage.getItem('refreshToken');
  },

  // Remove refresh token from localStorage
  removeRefreshToken: () => {
    localStorage.removeItem('refreshToken');
  },

  // Clear all auth data
  clearAll: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
  },

  // Store user data
  setUserData: (userData) => {
    localStorage.setItem('userData', JSON.stringify(userData));
  },

  // Get user data
  getUserData: () => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    return !!token;
  }
};

// Request interceptor to automatically add auth token
export function createAuthenticatedRequest(token) {
  return {
    get: async (url, options = {}) => {
      return fetch(url, {
        ...options,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          ...options.headers,
        },
      });
    },

    post: async (url, data, options = {}) => {
      return fetch(url, {
        ...options,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
        body: JSON.stringify(data),
      });
    },

    put: async (url, data, options = {}) => {
      return fetch(url, {
        ...options,
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
        body: JSON.stringify(data),
      });
    },

    delete: async (url, options = {}) => {
      return fetch(url, {
        ...options,
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          ...options.headers,
        },
      });
    },
  };
}
