/* Centralized API configuration and JWT handling. */
(() => {
  const hostname = window.location.hostname;
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";

  window.API_BASE_URL = isLocal
    ? "http://localhost:3000"
    : "https://student-management-backend-nbol.onrender.com";

  window.apiFetch = async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem("token");
    const headers = new Headers(options.headers || {});

    if (token) headers.set("Authorization", `Bearer ${token}`);

    if (
      options.body != null &&
      !(options.body instanceof FormData) &&
      !headers.has("Content-Type")
    ) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${window.API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userRole");

      const currentPage = window.location.pathname.split("/").pop();
      if (currentPage !== "login.html") {
        window.location.replace("login.html");
      }
      throw new Error("Your session has expired. Please log in again.");
    }

    return response;
  };
})();
