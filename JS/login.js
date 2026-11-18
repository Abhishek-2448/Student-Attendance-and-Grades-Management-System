
const API_URL = "https://student-management-backend-nbol.onrender.com";

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    try {
        loginMessage.textContent = "Logging in...";

        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Invalid username or password");
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userRole", data.role);

        window.location.replace("index.html");

    } catch (error) {
        loginMessage.textContent = error.message;
    }
});
