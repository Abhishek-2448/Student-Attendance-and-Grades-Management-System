
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  try {
    loginMessage.textContent = "Logging in...";

    const response = await fetch(`${window.API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Invalid username or password");
    }

    if (!data.token) {
      throw new Error("The server did not return an authentication token.");
    }

    // Remove any previous persistent authentication data.
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");

    // Store authentication only for the current browser session.
    sessionStorage.setItem("token", data.token);
    sessionStorage.setItem("isLoggedIn", "true");

    if (data.role) {
      sessionStorage.setItem("userRole", data.role);
    }

    window.location.replace("index.html");

  } catch (error) {
    loginMessage.textContent =
      error.message || "Unable to log in. Please try again.";
  }
});
