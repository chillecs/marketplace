import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router';

export const AuthContext = createContext(null);

const initialContextValue = {
  user: null,
  accesToken: null,
};

const storageKey = 'auth';

export function AuthContextProvider({ children }) {
  const navigate = useNavigate();
  const [auth, setAuth] = useState(() => {
    const fromStorage = localStorage.getItem(storageKey);

    if(fromStorage) {
      return JSON.parse(fromStorage);
    }

    return initialContextValue;    
  });

  function login(data) {
    localStorage.setItem(storageKey, JSON.stringify(data));
    setAuth(data);
  }

  function logout() {
    localStorage.removeItem(storageKey);
    setAuth(initialContextValue);
    navigate("/login");
  }

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
 
  if(ctx === null) {
    throw new Error('The useAuthContext hook should only be used in descendants of the <AuthContextProvider />!');
  }

  return ctx;
}
