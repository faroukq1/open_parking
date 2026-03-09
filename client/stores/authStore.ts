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
  updateUser: (updates: {
    full_name?: string;
    email?: string;
    phone?: string;
  }) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
  updateLicensePlate: (
    plateNumber: string,
    vehicleId?: number,
  ) => Promise<void>;
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

      // Update user profile
      updateUser: async (updates: {
        full_name?: string;
        email?: string;
        phone?: string;
      }) => {
        set({ loading: true, error: null });

        try {
          const currentUser = (useAuthStore.getState() as any).user;
          if (!currentUser) {
            throw new Error("No user logged in");
          }

          const response = await customFetch.patch(
            `/users/${currentUser.id}`,
            updates,
          );
          const userData = response.data || response;

          // Merge API response with current user to preserve all fields
          const updatedUser = {
            ...currentUser,
            ...userData,
          };

          set({ user: updatedUser, loading: false, error: null });
        } catch (error: any) {
          set({
            loading: false,
            error: error.message || "Profile update failed",
          });
          throw error;
        }
      },

      // Change password
      changePassword: async (currentPassword: string, newPassword: string) => {
        set({ loading: true, error: null });

        try {
          const currentUser = (useAuthStore.getState() as any).user;
          if (!currentUser) {
            throw new Error("No user logged in");
          }

          await customFetch.patch(`/users/${currentUser.id}/password`, {
            current_password: currentPassword,
            new_password: newPassword,
          });

          set({ loading: false, error: null });
        } catch (error: any) {
          set({
            loading: false,
            error: error.message || "Failed to change password",
          });
          throw error;
        }
      },

      // Update license plate
      updateLicensePlate: async (plateNumber: string, vehicleId?: number) => {
        set({ loading: true, error: null });

        try {
          const currentUser = (useAuthStore.getState() as any).user;
          if (!currentUser) {
            throw new Error("No user logged in");
          }

          const response = await customFetch.post(
            `/users/${currentUser.id}/vehicle`,
            {
              vehicle_id: vehicleId,
              plate_number: plateNumber,
            },
          );

          // Update user vehicles
          const updatedVehicles = currentUser.vehicles || [];
          if (vehicleId) {
            const index = updatedVehicles.findIndex((v) => v.id === vehicleId);
            if (index !== -1) {
              updatedVehicles[index] = response.data;
            }
          } else {
            updatedVehicles.push(response.data);
          }

          const updatedUser = {
            ...currentUser,
            vehicles: updatedVehicles,
          };

          set({ user: updatedUser, loading: false, error: null });
        } catch (error: any) {
          set({
            loading: false,
            error: error.message || "Failed to update license plate",
          });
          throw error;
        }
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
