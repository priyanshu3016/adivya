import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('tribal_auth_user_v2');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u && u.role === 'admin') {
          return {
            id: u.id || '001',
            adminId: '001',
            name: u.name && u.name !== 'R. K. Meena' ? u.name : 'Admin',
            role: 'admin',
            designation: u.designation || 'Admin',
            department: u.department || 'Adivya Administration',
            email: u.email || 'admin@adivya.gov.in'
          };
        }
        return u;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [activeRole, setActiveRole] = useState(() => {
    return currentUser?.role || 'applicant';
  });

  const [sessionApplication, setSessionApplication] = useState(() => {
    return api.getSubmittedApplication();
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('tribal_auth_user_v2', JSON.stringify(currentUser));
      setActiveRole(currentUser.role);
    } else {
      localStorage.removeItem('tribal_auth_user_v2');
    }
  }, [currentUser]);

  const loginApplicant = (identifier = '') => {
    let user;
    if (typeof identifier === 'object' && identifier !== null) {
      user = {
        id: identifier.id || identifier.email || 'APPLICANT-SESSION',
        name: identifier.name || 'Applicant',
        email: identifier.email || '',
        phone: identifier.phone || '',
        role: 'applicant',
        hasDeficiency: false
      };
    } else {
      const trimmed = typeof identifier === 'string' ? identifier.trim() : '';
      let name = 'Applicant';
      if (trimmed) {
        if (trimmed.includes('@')) {
          name = trimmed.split('@')[0];
        } else {
          name = trimmed;
        }
      }
      user = {
        id: trimmed || 'APPLICANT-SESSION',
        name: name,
        role: 'applicant',
        hasDeficiency: false
      };
    }
    setCurrentUser(user);
    setActiveRole('applicant');
  };

  const loginAdmin = (adminNameOrId = '') => {
    let name = 'Admin';
    if (typeof adminNameOrId === 'string' && adminNameOrId.trim()) {
      const trimmed = adminNameOrId.trim();
      if (trimmed.includes('@')) {
        const username = trimmed.split('@')[0];
        name = username
          .split(/[._-]/)
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ');
      } else {
        name = trimmed;
      }
    }

    const user = {
      id: '001',
      adminId: '001',
      name: name,
      role: 'admin',
      designation: 'Admin',
      department: 'Adivya Administration',
      email: `${name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'admin'}@adivya.gov.in`
    };
    setCurrentUser(user);
    setActiveRole('admin');
  };

  const logout = () => {
    setCurrentUser(null);
    setSessionApplication(null);
    api.setSubmittedApplication(null);
  };

  const resetAllDemoData = async () => {
    await api.resetToDefaultData();
    setCurrentUser(null);
    setSessionApplication(null);
    window.location.reload();
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activeRole,
        sessionApplication,
        setSessionApplication,
        loginApplicant,
        loginAdmin,
        logout,
        resetAllDemoData
      }}
    >
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
