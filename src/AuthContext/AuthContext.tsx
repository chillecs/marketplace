import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';

// Define the user interface
interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  // Add other user properties as needed
}

// Define the auth data interface
interface AuthData {
  user: User | null;
  accessToken: string | null; // Fixed typo from 'accesToken' to 'accessToken'
}

// Define the context interface
interface AuthContextType extends AuthData {
  login: (data: AuthData) => void;
  logout: () => void;
}

// Create the context with proper typing
export const AuthContext = createContext<AuthContextType | null>(null);

const initialContextValue: AuthData = {
  user: null,
  accessToken: null,
};

const storageKey = 'auth';

// Define props interface for the provider
interface AuthContextProviderProps {
  children: ReactNode;
}

export function AuthContextProvider({ children }: AuthContextProviderProps) {
  const navigate = useNavigate();
  const [auth, setAuth] = useState<AuthData>(() => {
    const fromStorage = localStorage.getItem(storageKey);

    if (fromStorage) {
      try {
        return JSON.parse(fromStorage);
      } catch (error) {
        console.error('Failed to parse auth data from localStorage:', error);
        return initialContextValue;
      }
    }

    return initialContextValue;
  });

  function login(data: AuthData): void {
    localStorage.setItem(storageKey, JSON.stringify(data));
    setAuth(data);
  }

  function logout(): void {
    localStorage.removeItem(storageKey);
    setAuth(initialContextValue);
    navigate("/");
  }

  const contextValue: AuthContextType = {
    ...auth,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextType {
  const ctx = useContext(AuthContext);
 
  if (ctx === null) {
    throw new Error('The useAuthContext hook should only be used in descendants of the <AuthContextProvider />!');
  }

  return ctx;
}
