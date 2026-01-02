import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const BASE_URL = "https://woa-backend.onrender.com";

const kycApi = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, 
  headers: { "Content-Type": "application/json" },
});

// Simple request interceptor - just adds token if available
kycApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      try {
        const authData = localStorage.getItem("authData");
        if (authData) {
          const parsedData = JSON.parse(authData);
          if (parsedData.token) {
            config.headers.Authorization = `Bearer ${parsedData.token}`;
          }
        }
      } catch (error) {
        console.error("Error reading auth token:", error);
      }
    }
    return config;
  },
  (error) => {
    console.error("KYC API request error:", error);
    return Promise.reject(error);
  }
);

kycApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // const originalRequest = error.config;
    
    console.error("KYC API error:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
    });
    
    if (error.response?.status === 401) {
      return Promise.reject(new Error("Authentication required. Please login again."));
    }
    
    return Promise.reject(error);
  }
);

export default kycApi;