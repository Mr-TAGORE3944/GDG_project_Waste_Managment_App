// utils/api.ts
import axios from "axios";
import { Alert } from "react-native";

const API_BASE_URL = "http://192.168.1.20:5000/api"; // Your backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for logging
api.interceptors.request.use((config) => {
  console.log("Making request to:", config.url);
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
    });

    if (error.response) {
      // Server responded with error status
      Alert.alert(
        "Request Failed",
        error.response.data?.message || `Status ${error.response.status}`
      );
    } else if (error.request) {
      // Request was made but no response
      Alert.alert("Network Error", "Server is not responding");
    } else {
      // Other errors
      Alert.alert("Error", error.message);
    }

    return Promise.reject(error);
  }
);

// Report API
export const submitReport = async (reportData: {
  userId: string;
  image: string;
  location: string;
  wasteType: string;
  amount: string;
  verificationData: object;
}) => {
  try {
    // Convert image to Base64 if needed
    const formData = new FormData();
    formData.append("image", {
      uri: reportData.image,
      type: "image/jpeg",
      name: "report.jpg",
    });
    formData.append("userId", reportData.userId);
    formData.append("location", reportData.location);
    formData.append("wasteType", reportData.wasteType);
    formData.append("amount", reportData.amount);
    formData.append(
      "verificationData",
      JSON.stringify(reportData.verificationData)
    );

    const response = await api.post("/reports", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Report submission error:", error);
    throw error;
  }
};

// Rewards API
export const fetchRewards = async () => {
  return api.get("/rewards");
};

export const redeemReward = async (userId: string, rewardId: string) => {
  return api.post("/rewards/redeem", { userId, rewardId });
};

// Tasks API
export const fetchTasks = async (userId: string) => {
  return api.get(`/tasks/${userId}`);
};

export const updateTaskStatus = async (taskId: string, status: string) => {
  return api.put(`/tasks/${taskId}/status`, { status });
};

// Leaderboard API
export const fetchLeaderboard = async (userId?: string) => {
  return api.get("/leaderboard", {
    params: userId ? { userId } : {},
  });
};
