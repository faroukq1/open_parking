import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import customFetch from "@/lib/customFetch";
import { tryCatch } from "@/lib/utils";

// Types
interface Vehicle {
  id: number;
  user_id: number;
  plate_number: string;
  created_at: string;
}

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

interface RegisterData {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  user_type?: "resident" | "visitor";
  room_number?: string;
  plate_numbers?: string[];
}

interface AuthStore {
  // State
  user: User | null;
  loading: boolean;
  error: string | null;
  isHydrated: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set: any) => ({
      // Initial state
      user: null,
      loading: false,
      error: null,
      isHydrated: false,

      // Login action
      login: async (email: string, password: string) => {
        set({ loading: true, error: null });

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

        if (success && userData) {
          const user = userData.data || userData;
          set({ user, loading: false, error: null });
        } else {
          set({
            loading: false,
            error: err || "Login failed",
          });
          throw new Error(err || "Login failed");
        }
      },

      // Register action
      register: async (data: RegisterData) => {
        set({ loading: true, error: null });

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

        if (success && userData) {
          const user = userData.data || userData;
          set({ user, loading: false, error: null });
        } else {
          set({
            loading: false,
            error: err || "Registration failed",
          });
          throw new Error(err || "Registration failed");
        }
      },

      // Logout action
      logout: () => {
        set({ user: null, error: null });
      },

      // Set hydration state
      setHydrated: (hydrated: boolean) => {
        set({ isHydrated: hydrated });
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state: any) => ({
        user: state.user,
      }),
      onRehydrateStorage: () => (state: any) => {
        state?.setHydrated(true);
      },
    },
  ),
);
