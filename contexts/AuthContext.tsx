// contexts/AuthContext.tsx
import React, { createContext, useState, useContext } from "react";
import axios from "axios";

interface User {
  id: string;
  email: string;
  token: string;
}
const API_BASE_URL = "http://192.168.1.20:5000/api/";
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });
      setUser(response.data.user); // Assume backend returns { user: { id, email, token } }
    } catch (error) {
      throw new Error("Login failed");
    }
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;
