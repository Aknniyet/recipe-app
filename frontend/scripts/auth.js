document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent page reload

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Send login request to the API
    const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role); 
        window.location.href = "dashboard.html";
    } else {
        alert("Login failed"); 
    }
});


document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent page reload

    const username = document.getElementById("username").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;
    const role = document.getElementById("role").value; 

    // Send registration request to the API
    await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, role })
    });

    alert("Registration successful! Please login.");
    window.location.href = "index.html"; 
});

document.getElementById("showRegister").addEventListener("click", () => {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("registerForm").style.display = "block";
});
