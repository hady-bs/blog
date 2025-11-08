// auth.js - Client-side token management

class AuthService {
  // Save token to localStorage
  static setToken(token) {
    localStorage.setItem("authToken", token);
  }

  // Get token from localStorage
  static getToken() {
    return localStorage.getItem("authToken");
  }

  // Remove token from localStorage (logout)
  static removeToken() {
    localStorage.removeItem("authToken");
  }

  // Check if user is authenticated
  static isAuthenticated() {
    const token = this.getToken();
    return !!token;
  }

  // Get token payload (user info)
  static getUserInfo() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }

  // Login function
  static async login(userName, password) {
    try {
      const response = await fetch("/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName, password }),
      });

      const data = await response.json();

      if (data.success && data.token) {
        this.setToken(data.token);
        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Network error" };
    }
  }

  // Register function
  static async register(userName, password) {
    try {
      const response = await fetch("/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName, password }),
      });

      const data = await response.json();

      if (data.success && data.token) {
        this.setToken(data.token);
        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, message: "Network error" };
    }
  }

  // Logout function
  static logout() {
    this.removeToken();
    window.location.href = "/login";
  }

  // Make authenticated requests
  static async makeAuthenticatedRequest(url, options = {}) {
    const token = this.getToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const defaultOptions = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    const mergedOptions = { ...defaultOptions, ...options };

    const response = await fetch(url, mergedOptions);

    if (response.status === 401) {
      this.removeToken();
      window.location.href = "/login";
      throw new Error("Authentication failed");
    }

    return response;
  }
}

// Check if user is logged in when page loads
document.addEventListener("DOMContentLoaded", function () {
  if (AuthService.isAuthenticated()) {
    // User is logged in
    const userInfo = AuthService.getUserInfo();
    console.log("User is logged in:", userInfo);

    // Show logout button, hide login button
    document.getElementById("loginBtn").style.display = "none";
    document.getElementById("logoutBtn").style.display = "block";
  } else {
    // User is not logged in
    console.log("User is not logged in");

    // Show login button, hide logout button
    document.getElementById("loginBtn").style.display = "block";
    document.getElementById("logoutBtn").style.display = "none";
  }
});

// Logout handler
document.getElementById("logoutBtn").addEventListener("click", function () {
  AuthService.logout();
});
console.log("hello World");
