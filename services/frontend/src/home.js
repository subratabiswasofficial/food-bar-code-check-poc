import $ from "jquery";

$(document).ready(function () {

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login first");
    window.location.href = "/";
    return;
  }

  $("#checkFood").on("click", function () {

    const barcode = $("#barcode").val();
    const file = $("#labelImage")[0].files[0];

    if (!barcode && !file) {
      alert("Enter barcode or upload label image");
      return;
    }

    const formData = new FormData();
    if (barcode) formData.append("barcode", barcode);
    if (file) formData.append("foodlabel", file);

    ajax({
      url: "http://localhost:3000/api/upload/food-label",
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      headers: {
        Authorization: `Bearer ${token}`
      },

      success: function (res) {
        analyzeFood(res.jobId);
      },

      error: function () {
        alert("❌ Upload failed");
      }
    });
  });

  function analyzeFood(jobId) {

    $("#result").removeClass("hidden");

    ajax({
      url: "http://localhost:3000/api/analyze/foodlabel",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ jobId }),
      headers: {
        Authorization: `Bearer ${token}`
      },

      success: function (res) {
        const data = res.data;
        if (!data) return;

        /* ========= INGREDIENTS ========= */
        $("#ingredientsList").empty();
        (data.ingredients || []).forEach(i =>
          $("#ingredientsList").append(`<li>${i}</li>`)
        );

        /* ========= NUTRITION ========= */
        $("#nutritionTable").empty();
        if (data.nutrients) {
          for (const key in data.nutrients) {
            $("#nutritionTable").append(`
              <div class="font-medium capitalize">${key.replace("_", " ")}</div>
              <div>${data.nutrients[key]}</div>
            `);
          }
        }

        /* ========= ALLERGENS ========= */
        if (data.allergens && data.allergens.length > 0) {
          $("#allergenBox").removeClass("hidden");
          $("#allergenList").empty();
          data.allergens.forEach(a =>
            $("#allergenList").append(`<li>${a}</li>`)
          );
        } else {
          $("#allergenBox").addClass("hidden");
        }

        /* ========= VEG / VEGAN ========= */
        $("#vegBadges").empty();

        if (data.is_vegetarian) {
          $("#vegBadges").append(`
            <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full">
              🌱 Vegetarian
            </span>
          `);
        }

        if (data.is_vegan) {
          $("#vegBadges").append(`
            <span class="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full">
              🥬 Vegan
            </span>
          `);
        }
      },

      error: function () {
        alert("❌ Analysis failed");
      }
    });
  }

  $("#logout").on("click", function () {
    localStorage.removeItem("token");
    window.location.href = "/";
  });

});