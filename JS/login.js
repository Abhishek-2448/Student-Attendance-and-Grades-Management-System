const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (username === "admin" && password === "admin123") {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userRole", "Admin");

        window.location.replace("index.html");
    } else {
        loginMessage.textContent = "Invalid username or password";
    }
});
