"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface Place {
  id: number;
  name: string;
  location: string;
  country: string;
  description: string;
  rating: number;
  price: number;
  type: "flight" | "stay" | "package" | "car";
  image: string;
  capacity: number;
  details: string;
}

interface NotificationLog {
  timestamp: string;
  email: string;
  username: string;
  title: string;
  message: string;
  channels: Record<string, { status: string; details: string }>;
}

interface AppContextType {
  user: User | null;
  token: string | null;
  theme: "dark" | "light";
  favorites: number[];
  notifications: NotificationLog[];
  places: Place[];
  apiStatus: any;
  loading: boolean;
  toggleTheme: () => void;
  toggleFavorite: (placeId: number) => void;
  loginUser: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerUser: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logoutUser: () => void;
  fetchNotifications: () => Promise<void>;
  searchPlaces: (query?: string, type?: string, country?: string) => Promise<Place[]>;
  createBooking: (placeId: number, travelDate: string, returnDate?: string, guests?: number) => Promise<{ success: boolean; error?: string; booking?: any }>;
  payBooking: (bookingId: number, paymentData: any) => Promise<{ success: boolean; error?: string }>;
  fetchUserBookings: () => Promise<any[]>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const API_BASE = "http://127.0.0.1:8000/api";

  // Initialize from LocalStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("lunar_theme") as "dark" | "light";
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
    }

    const savedToken = localStorage.getItem("lunar_token");
    const savedUser = localStorage.getItem("lunar_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }

    const savedFavs = localStorage.getItem("lunar_favs");
    if (savedFavs) {
      setFavorites(JSON.parse(savedFavs));
    }

    // Initial search/fetch
    const initFetch = async () => {
      try {
        const res = await fetch(`${API_BASE}/status`);
        const statusData = await res.json();
        setApiStatus(statusData);
      } catch (e) {
        console.warn("Could not connect to FastAPI backend. Make sure uvicorn is running.");
      }

      await searchPlaces();
      await fetchNotifications();
      setLoading(false);
    };

    initFetch();

    // Set polling interval for notification logs feed
    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("lunar_theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const toggleFavorite = (placeId: number) => {
    let updated;
    if (favorites.includes(placeId)) {
      updated = favorites.filter((id) => id !== placeId);
    } else {
      updated = [...favorites, placeId];
    }
    setFavorites(updated);
    localStorage.setItem("lunar_favs", JSON.stringify(updated));
  };

  const loginUser = async (username: string, password: string) => {
    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        return { success: false, error: err.detail || "Login failed" };
      }

      const data = await res.json();
      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem("lunar_token", data.access_token);
      localStorage.setItem("lunar_user", JSON.stringify(data.user));

      await fetchNotifications();
      return { success: true };
    } catch (e) {
      return { success: false, error: "Network error connecting to API" };
    }
  };

  const registerUser = async (username: string, email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        return { success: false, error: err.detail || "Registration failed" };
      }

      const data = await res.json();
      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem("lunar_token", data.access_token);
      localStorage.setItem("lunar_user", JSON.stringify(data.user));

      await fetchNotifications();
      return { success: true };
    } catch (e) {
      return { success: false, error: "Network error connecting to API" };
    }
  };

  const logoutUser = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("lunar_token");
    localStorage.removeItem("lunar_user");
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE}/notifications`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      // Silently fail if server not connected
    }
  };

  const searchPlaces = async (query?: string, type?: string, country?: string) => {
    try {
      let url = `${API_BASE}/places`;
      const params = new URLSearchParams();
      if (query) params.append("query", query);
      if (type) params.append("type", type);
      if (country) params.append("country", country);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPlaces(data);
        return data;
      }
    } catch (e) {
      console.warn("Could not fetch places. Displaying static mockup.");
    }
    return [];
  };

  const createBooking = async (placeId: number, travelDate: string, returnDate?: string, guests = 1) => {
    if (!token) return { success: false, error: "Please log in to complete your booking." };

    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ place_id: placeId, travel_date: travelDate, return_date: returnDate, guests }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.detail || "Booking failed" };
      }

      await fetchNotifications();
      return { success: true, booking: data.booking };
    } catch (e) {
      return { success: false, error: "Network error occurred." };
    }
  };

  const payBooking = async (bookingId: number, paymentData: any) => {
    if (!token) return { success: false, error: "Unauthorized" };

    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.detail || "Payment failed" };
      }

      await fetchNotifications();
      return { success: true };
    } catch (e) {
      return { success: false, error: "Network error occurred." };
    }
  };

  const fetchUserBookings = async () => {
    if (!token) return [];
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  };

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        theme,
        favorites,
        notifications,
        places,
        apiStatus,
        loading,
        toggleTheme,
        toggleFavorite,
        loginUser,
        registerUser,
        logoutUser,
        fetchNotifications,
        searchPlaces,
        createBooking,
        payBooking,
        fetchUserBookings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
