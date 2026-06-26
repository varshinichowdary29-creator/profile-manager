import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configure Axios defaults
  axios.defaults.baseURL = 'http://localhost:5000/api';

  useEffect(() => {
    const checkUserSession = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const res = await axios.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
          } else {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
          }
        } catch (err) {
          console.error('[AuthContext] Session validation error:', err.message);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    checkUserSession();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token, user: userData } = res.data;
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
        setLoading(false);
        return userData;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await axios.post('/auth/logout');
    } catch (err) {
      console.warn('[AuthContext] Server logout warning:', err.message);
    } finally {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setLoading(false);
    }
  };

  const register = async (name, email, password, role, parentDetails) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/auth/register', { name, email, password, role, parentDetails });
      if (res.data.success) {
        const { token, user: userData } = res.data;
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
        setLoading(false);
        return userData;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    role: user?.role || null
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
