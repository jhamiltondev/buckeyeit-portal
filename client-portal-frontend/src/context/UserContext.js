import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function useUser() {
  return useContext(UserContext);
}

// Helper to get CSRF token from cookie
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check current user on mount
  useEffect(() => {
    fetch('/api/user/', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.is_authenticated) {
          setUser(data);
        } else {
          setUser(null);
        }
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  const login = async (username, password) => {
    try {
      const res = await fetch('/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        return { success: true };
      } else {
        let errorMsg = 'Login failed';
        try {
          const data = await res.json();
          errorMsg = data.error || errorMsg;
        } catch {
          // If not JSON, keep default error
        }
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = async () => {
    try {
      const csrftoken = getCookie('csrftoken');
      const logoutRes = await fetch('/api/logout/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-CSRFToken': csrftoken,
          'Content-Type': 'application/json',
        },
      });
      console.log('Logout API response:', await logoutRes.json());
      // Wait 500ms to ensure backend clears session
      await new Promise(res => setTimeout(res, 500));
      // Check user status
      const userRes = await fetch('/api/user/', { credentials: 'include' });
      const userData = await userRes.json();
      console.log('User after logout:', userData);
      if (!userData.is_authenticated) {
        setUser(null);
        localStorage.clear();
        sessionStorage.clear();
        // Redirect to appropriate login page based on current URL
        const currentPath = window.location.pathname;
        const loginUrl = currentPath.startsWith('/adminpanel') ? '/adminpanel/login/' : '/login';
        window.location.href = loginUrl;
      } else {
        alert('Logout failed: still authenticated. Please clear cookies and try again.');
      }
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      localStorage.clear();
      sessionStorage.clear();
      // Redirect to appropriate login page based on current URL
      const currentPath = window.location.pathname;
      const loginUrl = currentPath.startsWith('/adminpanel') ? '/adminpanel/login/' : '/login';
      window.location.href = loginUrl;
    }
  };

  return (
    <UserContext.Provider value={{ user, isAuthenticated: !!user, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
} 