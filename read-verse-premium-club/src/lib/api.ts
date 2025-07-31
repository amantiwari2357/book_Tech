export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://book-tech.onrender.com/api';

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token: string) {
  localStorage.setItem('token', token);
}

export function removeToken() {
  localStorage.removeItem('token');
}

// Check if user is authenticated
export async function checkAuthStatus() {
  const token = getToken();
  if (!token) {
    return null;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'include',
    });
    
    if (response.ok) {
      const user = await response.json();
      return user;
    } else {
      // Token is invalid, remove it
      removeToken();
      return null;
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    removeToken();
    return null;
  }
}

export async function authFetch(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  
  const url = `${API_BASE_URL}${endpoint}`;
  console.log('Making API request to:', url);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'include',
    });
    
    console.log('API Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      
      // If token is invalid, remove it
      if (response.status === 401) {
        removeToken();
      }
      
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
} 