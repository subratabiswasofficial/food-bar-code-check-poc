const API_BASE = "http://localhost:3000/api/auth";

$(document).ready(function () {

  /* TAB SWITCH */
  $("#loginTab").click(function () {
    $("#loginForm").removeClass("hidden");
    $("#registerForm").addClass("hidden");
  });

  $("#registerTab").click(function () {
    $("#registerForm").removeClass("hidden");
    $("#loginForm").addClass("hidden");
  });

  /* ================= REGISTER ================= */
  $("#registerForm").submit(function (e) {
    e.preventDefault();

    const name = $("#regName").val();
    const email = $("#regEmail").val();
    const password = $("#regPassword").val();

    if (!name || !email || !password) {
      alert("❌ Fill all fields");
      return;
    }

    $.ajax({
      url: `${API_BASE}/register`,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ name, email, password }),

      success: function (res) {
        console.log(res);
        alert("✅ Registered Successfully");

        $("#registerForm")[0].reset();   // 🔥 important
        $("#loginTab").click();
      },

      error: function (xhr) {
        console.log(xhr);
        alert(xhr.responseJSON?.message || "Register failed");
      }
    });
  });

  /* ================= LOGIN ================= */
  $("#loginForm").submit(function (e) {
    e.preventDefault();

    const email = $("#loginEmail").val();
    const password = $("#loginPassword").val();

    if (!email || !password) {
      alert("❌ Enter email & password");
      return;
    }

    $.ajax({
      url: `${API_BASE}/login`,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ email, password }),

      success: function (res) {
        console.log(res);

        const token = res.token || res.data?.token;

        if (!token) {
          alert("⚠️ Token not found");
          return;
        }

        localStorage.setItem("token", token);

        alert("✅ Login Successful");
        window.location.href = "home.html";
      },

      error: function (xhr) {
        console.log(xhr);
        alert(xhr.responseJSON?.message || "Login failed");
      }
    });
  });

});