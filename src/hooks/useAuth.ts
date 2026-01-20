import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export interface MockUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: "user" | "vendor" | "superadmin";
  roles?: string[];
  permissions?: string[];
  forcePasswordChange?: boolean;
  emailVerified?: boolean;
}

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<MockUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);
  const navigate = useNavigate();

  // Mock data storage
  const mockUsers: MockUser[] = [
    {
      id: "user-1",
      email: "user@example.com",
      firstName: "John",
      lastName: "Doe",
      userType: "user",
      emailVerified: true,
    },
    {
      id: "vendor-1",
      email: "vendor@example.com",
      firstName: "Jane",
      lastName: "Smith",
      userType: "vendor",
      emailVerified: true,
    },
    {
      id: "admin-1",
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
      userType: "superadmin",
      roles: ["admin"],
      permissions: ["admin_access"],
      emailVerified: true,
    },
  ];

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const simulateDelay = async (ms: number = 1000) => {
    await new Promise(resolve => setTimeout(resolve, ms));
  };

  // Mock signin function
  const signin = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      await simulateDelay(1500);

      // Find user in mock data
      const foundUser = mockUsers.find(u => u.email === email);
      
      if (!foundUser) {
        throw new Error("Invalid email or password");
      }

      // For mock purposes, any password works
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      setUser(foundUser);
      setIsAuthenticated(true);
      
      // Store in localStorage for persistence
      localStorage.setItem("mockUser", JSON.stringify(foundUser));
      localStorage.setItem("mockAuth", "true");

      toast.success("Login successful!");
      
      // Auto-navigate based on user type
      setTimeout(() => {
        if (foundUser.userType === "superadmin") {
          navigate("/admin");
        } else if (foundUser.userType === "vendor") {
          navigate("/vendor");
        } else {
          navigate("/");
        }
      }, 1500);

      return foundUser;
    } catch (err: any) {
      const errorMessage = err.message || "Login failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Mock signup function
  const signup = useCallback(async (data: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      await simulateDelay(1500);

      // Check if email already exists
      const emailExists = mockUsers.some(u => u.email === data.email);
      if (emailExists) {
        throw new Error("Email already registered");
      }

      // Validate password
      if (data.password.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }

      // Create mock user
      const newUser: MockUser = {
        id: `user-${Date.now()}`,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        userType: "user",
        emailVerified: false,
      };

      // For simulation, we'll just set verification pending
      setVerificationPending(true);
      
      // Store registration data
      localStorage.setItem("pendingVerificationEmail", data.email);
      localStorage.setItem("pendingRegistrationData", JSON.stringify({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      }));

      toast.success("Registration successful! Please verify your email.");
      
      return newUser;
    } catch (err: any) {
      const errorMessage = err.message || "Registration failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Mock email availability check
  const checkEmailAvailability = useCallback(async (email: string) => {
    await simulateDelay(500);
    
    // Check if email exists in mock data
    const emailExists = mockUsers.some(u => u.email === email);
    
    return {
      available: !emailExists,
      message: emailExists ? "Email already registered" : "Email available",
    };
  }, []);

  // Mock social sign-ins
  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    
    try {
      await simulateDelay(2000);
      
      const googleUser: MockUser = {
        id: `google-${Date.now()}`,
        email: "google.user@example.com",
        firstName: "Google",
        lastName: "User",
        userType: "user",
        emailVerified: true,
      };

      setUser(googleUser);
      setIsAuthenticated(true);
      localStorage.setItem("mockUser", JSON.stringify(googleUser));
      localStorage.setItem("mockAuth", "true");

      toast.success("Google sign-in successful!");
      
      setTimeout(() => {
        navigate("/");
      }, 1500);

      return googleUser;
    } catch (err) {
      toast.error("Google sign-in failed. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const signInWithApple = useCallback(async () => {
    setLoading(true);
    
    try {
      await simulateDelay(2000);
      
      const appleUser: MockUser = {
        id: `apple-${Date.now()}`,
        email: "apple.user@example.com",
        firstName: "Apple",
        lastName: "User",
        userType: "user",
        emailVerified: true,
      };

      setUser(appleUser);
      setIsAuthenticated(true);
      localStorage.setItem("mockUser", JSON.stringify(appleUser));
      localStorage.setItem("mockAuth", "true");

      toast.success("Apple sign-in successful!");
      
      setTimeout(() => {
        navigate("/");
      }, 1500);

      return appleUser;
    } catch (err) {
      toast.error("Apple sign-in failed. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Initialize from localStorage on mount
  const initFromStorage = useCallback(() => {
    const storedUser = localStorage.getItem("mockUser");
    const storedAuth = localStorage.getItem("mockAuth");
    
    if (storedUser && storedAuth === "true") {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (err) {
        localStorage.removeItem("mockUser");
        localStorage.removeItem("mockAuth");
      }
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("mockUser");
    localStorage.removeItem("mockAuth");
    toast.success("Logged out successfully!");
    navigate("/auth/signin");
  }, [navigate]);

  return {
    // State
    loading,
    error,
    user,
    isAuthenticated,
    verificationPending,
    
    // Actions
    signin,
    signup,
    signInWithGoogle,
    signInWithApple,
    checkEmailAvailability,
    clearError,
    logout,
    initFromStorage,
  };
};