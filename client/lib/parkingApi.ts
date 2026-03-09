import customFetch from "./customFetch";

export interface ActiveBooking {
  id: string;
  spot_number: number;
  plate_number: string;
  status: "PARKED" | "RESERVED";
  entered_at: string;
}

export interface AvailableSpots {
  available: number;
  total: number;
}

export interface BookingHistory {
  id: string;
  spot_number: number;
  plate_number: string;
  status: string;
  entered_at?: string;
  exited_at?: string;
  created_at: string;
}

/**
 * Fetch active booking for a specific user
 */
export const fetchActiveBooking = async (
  userId: string,
): Promise<ActiveBooking | null> => {
  try {
    const response = await customFetch.get(`/bookings/active/${userId}`);
    const data = response.data;

    // Backend returns {active: false} when no active booking
    if (!data.active || data.active === false) {
      return null;
    }

    return data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null; // No active booking
    }
    throw error;
  }
};

/**
 * Fetch available spots count
 */
export const fetchAvailableSpots = async (): Promise<AvailableSpots> => {
  try {
    const response = await customFetch.get("/spots/available-count");
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch booking history (last 3 bookings)
 */
export const fetchBookingHistory = async (
  userId: string,
  limit: number = 3,
): Promise<BookingHistory[]> => {
  try {
    const response = await customFetch.get(`/bookings/history/${userId}`, {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: number,
  data: {
    full_name?: string;
    email?: string;
    phone?: string;
  },
) => {
  try {
    const response = await customFetch.patch(`/users/${userId}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Change user password
 */
export const changePassword = async (
  userId: number,
  currentPassword: string,
  newPassword: string,
) => {
  try {
    const response = await customFetch.patch(`/users/${userId}/password`, {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Add or update vehicle license plate
 */
export const updateLicensePlate = async (
  userId: number,
  plateNumber: string,
  vehicleId?: number,
) => {
  try {
    const response = await customFetch.post(`/users/${userId}/vehicle`, {
      vehicle_id: vehicleId,
      plate_number: plateNumber,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
