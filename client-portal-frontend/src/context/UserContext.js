import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function useUser() {
  return useContext(UserContext);
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
    await fetch('/api/logout/', {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, isAuthenticated: !!user, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
} 