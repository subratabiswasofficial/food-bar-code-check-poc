$(document).ready(function () {

  /* ================= AUTH GUARD ================= */
  const token = localStorage.getItem("token");

  if (!token) {
    alert("❌ Please login first");
    window.location.href = "auth.html";
    return;
  }

  /* ================= PROFILE VERIFY ================= */
  fetch("http://localhost:3000/api/profile", {
    headers: {
      Authorization: "Bearer " + token
    }
  })
    .then(res => {
      if (!res.ok) throw new Error("Invalid token");
      return res.json();
    })
    .then(data => {
      console.log("✅ User verified", data);

      // 👉 UI me show (optional)
      if (document.getElementById("userName")) {
        document.getElementById("userName").innerText =
          "👤 User ID: " + data.userId;
      }
    })
    .catch(() => {
      alert("⏳ Session expired, login again");

      localStorage.removeItem("token");
      window.location.href = "auth.html";
    });
  /* ================= IMAGE UPLOAD ================= */
  $("#labelImage").on("change", function () {
    const file = this.files[0];
    if (!file) return;

    $("#file-label").text(file.name);

    const reader = new FileReader();
    reader.onload = function (e) {
      $("#img-preview").attr("src", e.target.result);
      $("#img-preview-box").show();
    };
    reader.readAsDataURL(file);
  });

  $("#btn-clear-img").on("click", function () {
    $("#labelImage").val("");
    $("#file-label").text("Click to choose image or drag & drop");
    $("#img-preview-box").hide();
    $("#img-preview").attr("src", "");
  });

  /* ================= HELPERS ================= */
  function showLoader() { $("#loader").removeClass("hidden").addClass("flex"); }
  function hideLoader() { $("#loader").addClass("hidden").removeClass("flex"); }
  function showResults() { $("#result").removeClass("hidden"); }
  function hideResults() { $("#result").addClass("hidden"); }

  function showError(msg) {
    $("#error-msg").text(msg);
    $("#error-card").removeClass("hidden").addClass("flex");
  }

  function hideError() {
    $("#error-card").addClass("hidden").removeClass("flex");
  }

  /* ================= CHECK FOOD ================= */
  $("#checkFood").on("click", function () {
    const barcode = $("#barcode").val().trim();
    const file = $("#labelImage")[0].files[0];

    if (!barcode && !file) {
      showError("Enter barcode or upload image");
      return;
    }

    hideError();
    showLoader();
    hideResults();

    if (file) {
      uploadAndAnalyze(barcode, file);
    } else {
      lookupBarcode(barcode);
    }
  });

  /* ================= BARCODE API ================= */
  function lookupBarcode(barcode) {
    $.ajax({
      url: `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
      method: "GET",
      success: function (data) {
        hideLoader();
        if (data.status !== 1) {
          showError("Product not found");
        } else {
          renderSimple(data.product);
        }
      },
      error: function () {
        hideLoader();
        showError("Network error");
      }
    });
  }

  /* ================= IMAGE UPLOAD ================= */
  function uploadAndAnalyze(barcode, file) {
    const formData = new FormData();
    if (barcode) formData.append("barcode", barcode);
    formData.append("foodlabel", file);

    $.ajax({
      url: "http://localhost:3000/api/upload/food-label",
      method: "POST",
      data: formData,
      processData: false,
      contentType: false,
      headers: {
        Authorization: "Bearer " + token
      },
      success: function (res) {
        analyzeFood(res.jobId);
      },
      error: function () {
        hideLoader();
        showError("Upload failed");
      }
    });
  }

  function analyzeFood(jobId) {
    $.ajax({
      url: "http://localhost:3000/api/analyze/foodlabel",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ jobId }),
      headers: {
        Authorization: "Bearer " + token
      },
      success: function (res) {
        hideLoader();
        renderSimple(res.data);
      },
      error: function () {
        hideLoader();
        showError("Analysis failed");
      }
    });
  }

  /* ================= SIMPLE RENDER ================= */
  function renderSimple(data) {
    $("#product-name").text(data.product_name || "Product");
    $("#result").removeClass("hidden");
  }

  $("#logout").on("click", function () {

    fetch("http://localhost:3000/api/auth/logout", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token
      }
    })
      .then(() => {
        localStorage.removeItem("token");

        alert("👋 Logged out");

        window.location.href = "auth.html";
      })
      .catch(() => {
        alert("Logout failed");
      });

  });