import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

export type Role = 'Admin' | 'User' | 'Company';

export interface User {
  id: string;
  login: string;
  email: string;
  role: Role;
  profilePic?: string | null;
}

interface AuthContextType {
  user: User | null;
  login: (accessToken: string, refreshToken: string, userId?: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Extract all relevant fields robustly from a decoded JWT payload. */
function extractFromToken(decoded: any): { id: string; login: string; email: string; role: Role } {
  // User id — prefer standard 'sub', fall back to full SOAP NameIdentifier URI
  const id: string =
    decoded['sub'] ||
    decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
    '';

  // Role — try short key first, then Microsoft schema URI
  const rawRole: string =
    decoded['role'] ||
    decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
    'user';

  let role: Role = 'User';
  if (rawRole.toLowerCase() === 'admin') role = 'Admin';
  else if (rawRole.toLowerCase() === 'company') role = 'Company';

  // Login/name
  const login: string =
    decoded['login'] ||
    decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
    '';

  // Email
  const email: string =
    decoded['email'] ||
    decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
    '';

  return { id, login, email, role };
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Attempt to restore user session from localStorage by re-parsing the token.
    const token = localStorage.getItem('accessToken');

    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        // Respect token expiry
        if (decoded.exp && decoded.exp * 1000 > Date.now()) {
          const { id, login, email, role } = extractFromToken(decoded);

          // Auto-repair any stale/missing localStorage keys so subsequent page loads are clean
          if (id) localStorage.setItem('userId', id);
          localStorage.setItem('role', role);
          if (login) localStorage.setItem('login', login);

          setUser({ id, login, email, role });
        } else {
          // Expired — clear storage
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userId');
          localStorage.removeItem('role');
          localStorage.removeItem('login');
        }
      } catch (err) {
        console.error('Invalid token on load', err);
      }
    }

    setIsLoading(false);
  }, []);

  const login = (accessToken: string, refreshToken: string, _userId?: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    try {
      const decoded: any = jwtDecode(accessToken);
      const { id, login: loginName, email, role } = extractFromToken(decoded);

      // Always derive the user id from the token — never from the caller argument
      // (the login endpoint did not previously return userId in the response body)
      localStorage.setItem('userId', id);
      localStorage.setItem('role', role);
      localStorage.setItem('login', loginName);

      setUser({ id, login: loginName, email, role });
    } catch (err) {
      console.error('Failed to decode token on login', err);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('login');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
