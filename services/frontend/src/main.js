console.log("JS Loaded ✅");

$(document).ready(function () {

  console.log("Document Ready ✅");

  /* LOGIN TAB */
  $("#loginTab").click(function () {
    $("#loginForm").removeClass("hidden");
    $("#registerForm").addClass("hidden");

    $("#loginTab").addClass("tab-active").removeClass("tab-inactive");
    $("#registerTab").addClass("tab-inactive").removeClass("tab-active");
  });

  /* REGISTER TAB */
  $("#registerTab").click(function () {
    $("#registerForm").removeClass("hidden");
    $("#loginForm").addClass("hidden");

    $("#registerTab").addClass("tab-active").removeClass("tab-inactive");
    $("#loginTab").addClass("tab-inactive").removeClass("tab-active");
  });

  /* REGISTER (SAVE USER) */
  $("#registerForm").submit(function (e) {
    e.preventDefault();

    const name = $("#regName").val();
    const email = $("#regEmail").val();
    const password = $("#regPassword").val();

    if (!name || !email || !password) {
      alert("❌ Fill all fields");
      return;
    }

    // 👉 Save user in localStorage
    const user = { name, email, password };
    localStorage.setItem("user", JSON.stringify(user));

    alert("✅ Registration Successful");

    $("#registerForm")[0].reset();
    $("#loginTab").click();
  });

  /* LOGIN (CHECK USER) */
  $("#loginForm").submit(function (e) {
    e.preventDefault();

    const email = $("#loginEmail").val();
    const password = $("#loginPassword").val();

    if (!email || !password) {
      alert("❌ Enter email & password");
      return;
    }

    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser) {
      alert("❌ No user found, please register first");
      return;
    }

    if (email === storedUser.email && password === storedUser.password) {
      alert("✅ Login Successful");

      // 👉 mark logged in
      localStorage.setItem("isLoggedIn", "true");

      window.location.href = "home.html";
    } else {
      alert("❌ Invalid email or password");
    }
  });

});