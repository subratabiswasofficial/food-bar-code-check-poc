const API_BASE = "http://localhost:3000/api/auth";

/* ─────────────────────────────────────────
   TOAST helper
───────────────────────────────────────── */
function showToast(msg, type = "success") {
  const $t = $("#toast");
  $t.text(msg).attr("class", type).fadeIn(200);
  setTimeout(() => $t.fadeOut(300), 3000);
}

$(document).ready(function () {

  /* ── If already logged in, skip to home ── */
  if (localStorage.getItem("token")) {
    window.location.href = "home.html";
    return;
  }

  /* ─────────────────────────────────────────
     MODAL open / close
  ───────────────────────────────────────── */
  $("#openModal").on("click", function () {
    $("#overlay").removeClass("hidden");
  });

  $("#closeModal").on("click", function () {
    $("#overlay").addClass("hidden");
  });

  /* Close on backdrop click */
  $("#overlay").on("click", function (e) {
    if ($(e.target).is("#overlay")) {
      $("#overlay").addClass("hidden");
    }
  });

  /* Close on Escape key */
  $(document).on("keydown", function (e) {
    if (e.key === "Escape") $("#overlay").addClass("hidden");
  });

  /* ─────────────────────────────────────────
     TABS — Login / Register
  ───────────────────────────────────────── */
  $("#loginForm").removeClass("hidden");
  $("#registerForm").addClass("hidden");

  $("#loginTab").on("click", function () {
    $("#loginForm").removeClass("hidden");
    $("#registerForm").addClass("hidden");
    $("#loginTab").attr("class", "w-1/2 pb-3 text-sm transition-all tab-active");
    $("#registerTab").attr("class", "w-1/2 pb-3 text-sm transition-all tab-inactive");
  });

  $("#registerTab").on("click", function () {
    $("#registerForm").removeClass("hidden");
    $("#loginForm").addClass("hidden");
    $("#registerTab").attr("class", "w-1/2 pb-3 text-sm transition-all tab-active");
    $("#loginTab").attr("class", "w-1/2 pb-3 text-sm transition-all tab-inactive");
  });

  /* ─────────────────────────────────────────
     REGISTER
  ───────────────────────────────────────── */
  $("#registerForm").on("submit", function (e) {
    e.preventDefault();

    const payload = {
      name:     $("#regName").val(),
      email:    $("#regEmail").val(),
      password: $("#regPassword").val()
    };

    $.ajax({
      url: `${API_BASE}/register`,
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(payload),
      success: function () {
        showToast("✅ Registration successful! Please login.");
        $("#registerForm")[0].reset();
        $("#loginTab").trigger("click");
      },
      error: function (xhr) {
        showToast(xhr.responseJSON?.message || "❌ Register failed", "error");
      }
    });
  });

  /* ─────────────────────────────────────────
     LOGIN
  ───────────────────────────────────────── */
  $("#loginForm").on("submit", function (e) {
    e.preventDefault();

    const payload = {
      email:    $("#loginEmail").val(),
      password: $("#loginPassword").val()
    };

    $.ajax({
      url: `${API_BASE}/login`,
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(payload),
      success: function (res) {
        localStorage.setItem("token", res.token);
        showToast("✅ Login successful!");
        setTimeout(() => {
          $("#overlay").addClass("hidden");
          window.location.href = "home.html";
        }, 800);
      },
      error: function (xhr) {
        showToast(xhr.responseJSON?.message || "❌ Login failed", "error");
      }
    });
  });

});