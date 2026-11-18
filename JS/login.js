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
    if (!data.token) throw new Error("The server did not return an authentication token.");

    localStorage.setItem("token", data.token);
    localStorage.setItem("isLoggedIn", "true");
    if (data.role) localStorage.setItem("userRole", data.role);

    window.location.replace("index.html");
  } catch (error) {
    loginMessage.textContent = error.message || "Unable to log in. Please try again.";
  }
});
