import "./style.css";

const API_BASE = "http://localhost:3000/api/auth";

$(document).ready(function () {
  
  $("#openModal").on("click", function () {
    $("#overlay").removeClass("hidden");
  });

  $("#closeModal").on("click", function () {
    $("#overlay").addClass("hidden");
  });

  
  $("#loginForm").removeClass("hidden");
  $("#registerForm").addClass("hidden");

  
  $("#loginTab").on("click", function () {
    $("#loginForm").removeClass("hidden");
    $("#registerForm").addClass("hidden");

    $("#loginTab").attr(
      "class",
      "w-1/2 py-2 font-semibold border-b-2 border-indigo-600 text-indigo-600"
    );
    $("#registerTab").attr(
      "class",
      "w-1/2 py-2 font-semibold border-b-2 border-transparent text-gray-500"
    );
  });

  $("#registerTab").on("click", function () {
    $("#registerForm").removeClass("hidden");
    $("#loginForm").addClass("hidden");

    $("#registerTab").attr(
      "class",
      "w-1/2 py-2 font-semibold border-b-2 border-indigo-600 text-indigo-600"
    );
    $("#loginTab").attr(
      "class",
      "w-1/2 py-2 font-semibold border-b-2 border-transparent text-gray-500"
    );
  });

  
  $("#registerForm").on("submit", function (e) {
    e.preventDefault();

    const payload = {
      name: $("#regName").val(),
      email: $("#regEmail").val(),
      password: $("#regPassword").val()
    };

    $.ajax({
      url: `${API_BASE}/register`,
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(payload),

      success: function (res) {
        alert("✅ Registration successful");
        $("#registerForm")[0].reset();
        $("#loginTab").click(); // auto switch
      },

      error: function (xhr) {
        alert(xhr.responseJSON?.message || "❌ Register failed");
      }
    });
  });

  /* =========================
     LOGIN API
  ========================== */
  $("#loginForm").on("submit", function (e) {
    e.preventDefault();

    const payload = {
      email: $("#loginEmail").val(),
      password: $("#loginPassword").val()
    };

    $.ajax({
      url: `${API_BASE}/login`,
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(payload),

      success: function (res) {
        // 🔐 Save JWT token
        localStorage.setItem("token", res.token);

        alert("✅ Login successful");
        $("#overlay").addClass("hidden");
      },

      error: function (xhr) {
        alert(xhr.responseJSON?.message || "❌ Login failed");
      }
    });
  });
});