import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      const token = localStorage.getItem('authToken');
      
      if (token) {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.data.user);
          setIsAuthenticated(true);
          setAuthError(null);
        } else {
          localStorage.removeItem('authToken');
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      setAuthError({ type: 'auth_required', message: error.message });
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  useEffect(() => {
    checkUserAuth();
  }, []);

  const login = async (email, password, expectedRole = null) => {
    try {
      setIsLoadingAuth(true);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, expectedRole })
      });

      const data = await response.json();
      
      if (response.ok) {
        // If expectedRole is provided, validate that user role matches
        if (expectedRole && data.data.user.role !== expectedRole) {
          const error = { type: 'role_mismatch', message: `Invalid credentials for ${expectedRole} access` };
          setAuthError(error);
          return { success: false, error };
        }
        
        setUser(data.data.user);
        setIsAuthenticated(true);
        setAuthError(null);
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('authUser', JSON.stringify(data.data.user));
        
        // Navigate to dashboard after successful login
        navigate('/');
        
        return { success: true, user: data.data.user };
      } else {
        const error = { type: 'invalid_credentials', message: data.error || 'Invalid email or password' };
        setAuthError(error);
        return { success: false, error };
      }
    } catch (error) {
      const authError = { type: 'auth_error', message: error.message };
      setAuthError(authError);
      return { success: false, error: authError };
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const signup = async (userData) => {
    try {
      setIsLoadingAuth(true);
      
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      
      if (response.ok) {
        // Auto-login after signup
        setUser(data.data.user);
        setIsAuthenticated(true);
        setAuthError(null);
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('authUser', JSON.stringify(data.data.user));
        
        // Navigate to dashboard after successful signup
        navigate('/');
        
        return { success: true, user: data.data.user };
      } else {
        const error = { type: 'signup_error', message: data.error || 'Signup failed' };
        setAuthError(error);
        return { success: false, error };
      }
    } catch (error) {
      const authError = { type: 'signup_error', message: error.message };
      setAuthError(authError);
      return { success: false, error: authError };
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setAuthError(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    navigate('/login');
  };

  const forgotPassword = async (email) => {
    try {
      setIsLoadingAuth(true);
      
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, message: 'Password reset instructions sent to your email' };
      } else {
        const error = { type: 'user_not_found', message: data.error || 'No user found with this email' };
        setAuthError(error);
        return { success: false, error };
      }
    } catch (error) {
      const authError = { type: 'forgot_password_error', message: error.message };
      setAuthError(authError);
      return { success: false, error: authError };
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      setIsLoadingAuth(true);
      
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, password: newPassword })
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, message: 'Password reset successfully' };
      } else {
        const error = { type: 'reset_password_error', message: data.error || 'Password reset failed' };
        setAuthError(error);
        return { success: false, error };
      }
    } catch (error) {
      const authError = { type: 'reset_password_error', message: error.message };
      setAuthError(authError);
      return { success: false, error: authError };
    } finally {
      setIsLoadingAuth(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      authError,
      authChecked,
      login,
      signup,
      logout,
      forgotPassword,
      resetPassword,
      checkUserAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
