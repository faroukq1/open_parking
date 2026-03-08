import { createContext, useContext, useState, ReactNode } from "react";
import customFetch from "@/lib/customFetch";
import { tryCatch } from "@/lib/utils";

interface User {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  user_type: "resident" | "visitor";
  room_number?: string;
  created_at: string;
  vehicles: Vehicle[];
}

interface Vehicle {
  id: number;
  user_id: number;
  plate_number: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  register: (data: RegisterData) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  user_type?: "resident" | "visitor";
  room_number?: string;
  plate_numbers?: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (data: RegisterData) => {
    setLoading(true);
    setError(null);
    const {
      success,
      data: userData,
      error: err,
    } = await tryCatch(
      () =>
        customFetch.post("/auth/register", {
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          password: data.password,
          user_type: data.user_type || "visitor",
          room_number: data.room_number || null,
          plate_numbers: data.plate_numbers || [],
        }),
      "Registration failed",
    );
    setLoading(false);
    if (success && userData) {
      setUser(userData.data);
    } else {
      setError(err || "Registration failed");
      throw new Error(err);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const {
      success,
      data: userData,
      error: err,
    } = await tryCatch(
      () =>
        customFetch.post("/auth/login", {
          email,
          password,
        }),
      "Login failed",
    );
    setLoading(false);
    if (success && userData) {
      const user = userData.data || userData;
      setUser(user);
    } else {
      setError(err || "Login failed");
      throw new Error(err);
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, register, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
